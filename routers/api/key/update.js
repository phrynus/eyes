const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const { keyId, name, safe_tradeList, safe_num, safe_both, safe_trade } =
      ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }

    if (safe_tradeList) {
      for (let key in safe_tradeList) {
        // 用正则判断格式
        if (
          !/^[\d]{1,3}$/.test(safe_tradeList[key].Lever) ||
          !/^(true|false)$/.test(safe_tradeList[key].split) ||
          !/^(true|false)$/.test(safe_tradeList[key].full) ||
          !/^(true|false)$/.test(safe_tradeList[key].must)
        ) {
          ctx.status = 400;
          ctx.body = "格式错误";
          return;
        }
      }
    }

    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    console.log(key, safe_tradeList || key.safe_tradeList);
    key.name = name || key.name;
    key.safe_tradeList = safe_tradeList || key.safe_tradeList;
    key.safe_num = safe_num || key.safe_num;
    key.safe_both = safe_both || key.safe_both;
    key.safe_trade = safe_trade || key.safe_trade;
    await key.save();
    ctx.body = {
      _id: key._id,
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
      safe_tradeList: key.safe_tradeList,
      safe_num: key.safe_num,
      safe_both: key.safe_both,
      safe_trade: key.safe_trade,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY更新] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 更新标记ID
router.post("/mark", async (ctx) => {
  try {
    const { keyId } = ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    key.markId = randomId("mark", Date.now());
    key.seeId = randomId("see", Date.now());
    await key.save();
    ctx.body = {
      _id: key._id,
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY更新标记] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 删除策略
router.post("/ployDelete", async (ctx) => {
  try {
    const { keyId, ployId } = ctx.request.body;
    if (!keyId || !ployId) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    const ploy = await db.Ploy.findById(ployId);
    if (!ploy) {
      ctx.status = 400;
      ctx.body = "策略不存在";
      return;
    }
    key.ployId = key.ployId.filter((id) => id !== ployId);
    await key.save();
    ploy.keyId = ploy.keyId.filter((id) => id !== keyId);
    await ploy.save();

    for (let j = 0; j < key.ployId.length; j++) {
      let ploy = await db.Ploy.findOne({ _id: key.ployId[j] });
      let user = await db.User.findOne({ _id: ploy.userId });
      key.ployId[j] = {
        ploy: ploy._id,
        ployName: ploy.name,
        ployUser: user.name,
      };
    }

    ctx.body = {
      _id: key._id,
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
      ployId: key.ployId,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY删除策略] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
module.exports = router;
