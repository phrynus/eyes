const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");

const routerUpdate = new koaRouter();

const router = new koaRouter();

router.post("/add", async (ctx) => {
  try {
    const {
      exchange,
      key,
      secret,
      password = "",
      name,
      safe_tradeList = {},
      safe_mustSymbol = {},
      safe_num = 10,
      safe_full = true,
      safe_both = true,
      safe_trade = true,
    } = ctx.request.body;
    // 判断参数
    if (!exchange || !key || !secret || !name) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    // 判断是否存在
    const keyExist = await db.Key.findOne({ exchange, key });
    if (keyExist) {
      ctx.status = 400;
      ctx.body = "KEY已存在";
      return;
    }
    // 判断名下有多少个KEY
    const keys = await db.Key.find({ userId: ctx.user.userId });
    if (keys.length > 2) {
      ctx.status = 400;
      ctx.body = "KEY数量已达上限";
      return;
    }
    // 添加
    const newKey = new db.Key({
      // 用户ID
      userId: ctx.user.userId,
      // 标记ID
      markId: randomId(
        "mark",
        ctx.user.userId,
        exchange,
        key,
        secret,
        password,
        name,
        Date.now(),
      ),
      // 观摩ID
      seeId: randomId(
        "see",
        ctx.user.userId,
        exchange,
        key,
        secret,
        password,
        name,
        Date.now(),
      ),
      // 策略ID
      ployId: [],
      exchange,
      key,
      secret,
      password,
      name,
      safe_tradeList,
      safe_mustSymbol,
      safe_num,
      safe_full,
      safe_both,
      safe_trade,
    });
    await newKey.save();

    ctx.body = {
      name: newKey.name,
      exchange: newKey.exchange,
      markId: newKey.markId,
      seeId: newKey.seeId,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY添加] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 删除key
router.post("/delete", async (ctx) => {
  try {
    const { keyId } = ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const key = await db.Key.findOne({ _id: keyId });
    if (!key) {
      ctx.status = 400;
      ctx.body = "KEY不存在";
      return;
    }
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "KEY与账户不符";
      return;
    }
    // 删除策略
    for (let i = 0; i < key.ployId.length; i++) {
      const ploy = await db.Ploy.findOne({ _id: key.ployId[i] });
      if (!ploy) {
        continue;
      }
      ploy.keyId = ploy.keyId.filter((item) => item !== keyId);
      await db.Ploy.updateOne(
        {
          _id: ploy._id,
        },
        {
          $set: {
            keyId: ploy.keyId,
          },
        },
      );
    }

    await db.Key.deleteOne({ _id: keyId });
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][KEY删除] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

router.use("/update", routerUpdate.routes(), routerUpdate.allowedMethods());

module.exports = router;
