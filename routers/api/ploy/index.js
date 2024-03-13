const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");
const routerKey = require("./key");
const router = new koaRouter();

router.post("/add", async (ctx) => {
  try {
    const { name, safe_lever = 1 } = ctx.request.body;
    // 判断参数
    if (!name) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    // 判断名下有多少个策略
    const ploys = await db.Ploy.find({ userId: ctx.user.userId });
    if (ploys.length >= 2) {
      ctx.status = 400;
      ctx.body = "策略数量已达上限";
      return;
    }
    // 添加
    const newPloy = new db.Ploy({
      // 用户ID
      userId: ctx.user.userId,
      // 标记ID
      markId: randomId("mark", ctx.user.userId, name, Date.now()),
      // keyID
      keyId: [],
      // 名称
      name,
      // 安全模式 - 倍数
      safe_lever,
    });
    await newPloy.save();
    ctx.body = {
      name: newPloy.name,
      id: newPloy._id,
    };
  } catch (err) {
    logger.error(
      `[错误][策略添加] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
router.post("/delete", async (ctx) => {
  try {
    const { ployId } = ctx.request.body;
    if (!ployId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const ploy = await db.Ploy.findOne({ _id: ployId });
    if (!ploy) {
      ctx.status = 400;
      ctx.body = "KEY不存在";
      return;
    }
    if (ploy.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "策略不属于该账户";
      return;
    }
    // 删除策略里面的key
    for (let i = 0; i < ploy.keyId.length; i++) {
      const key = await db.Key.findOne({ _id: ploy.keyId[i] });
      if (!key) {
        continue;
      }
      key.ployId = key.ployId.filter((item) => item !== ployId);
      await db.Key.updateOne(
        { _id: key._id },
        {
          $set: {
            ployId: key.ployId,
          },
        },
      );
    }

    await db.Ploy.deleteOne({ _id: ployId });
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][策略删除] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

router.use("/key", routerKey.routes(), routerKey.allowedMethods());
module.exports = router;
