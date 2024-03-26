const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const config = require("../../../config");

const router = new koaRouter();
router.post("/add", async (ctx) => {
  try {
    const { keyId, ployId } = ctx.request.body;
    if (!keyId || !ployId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const key = await db.Key.findOne({ _id: keyId });
    const user = await db.User.findOne({ _id: key.userId });
    const ploy = await db.Ploy.findOne({ _id: ployId });
    const ployUser = await db.User.findOne({ _id: ploy.userId });

    if (!key || !ploy) {
      ctx.status = 400;
      ctx.body = "KEY或策略不存在";
      return;
    }
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "KEY不属于该账户";
      return;
    } else if (ploy.keyId.hasOwnProperty(keyId)) {
      ctx.status = 400;
      ctx.body = "KEY已经添加";
      return;
    } else if (Object.keys(ploy.keyId).length >= 10) {
      ctx.status = 400;
      ctx.body = "策略KEY数量已达上限";
      return;
    } else {
      ploy.keyId[keyId] = {};
      ploy.keyId[keyId].key = keyId;
      ploy.keyId[keyId].keyName = key.name;
      ploy.keyId[keyId].keyUser = user.name;
      await db.Ploy.updateOne(
        { _id: ployId },
        {
          $set: {
            keyId: ploy.keyId,
          },
        },
      );
      key.ployId[ployId] = {};
      key.ployId[ployId].ploy = ployId;
      key.ployId[ployId].ployName = ploy.name;
      key.ployId[ployId].ployUser = ployUser.name;
      key.ployId[ployId].lever = 1;
      await db.Key.updateOne(
        { _id: keyId },
        {
          $set: {
            ployId: key.ployId,
          },
        },
      );
    }

    ctx.body = ploy.keyId;
  } catch (err) {
    logger.error(
      `[错误][策略添加KEY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
router.post("/delete", async (ctx) => {
  try {
    const { keyId, ployId } = ctx.request.body;
    if (!keyId || !ployId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const key = await db.Key.findOne({ _id: keyId });
    const ploy = await db.Ploy.findOne({ _id: ployId });
    if (!key || !ploy) {
      ctx.status = 400;
      ctx.body = "KEY或策略不存在";
      return;
    }
    if (ploy.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "策略不属于该账户";
      return;
    }
    // 删除KEY
    delete ploy.keyId[keyId];
    await db.Ploy.updateOne(
      { _id: ploy._id },
      {
        $set: {
          keyId: ploy.keyId,
        },
      },
    );
    // 删除策略
    delete key.ployId[ployId];
    await db.Key.updateOne(
      { _id: key._id },
      {
        $set: {
          ployId: key.ployId,
        },
      },
    );

    ctx.body = ploy.keyId;
  } catch (err) {
    logger.error(
      `[错误][策略删除KEY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
router.post("/list", async (ctx) => {
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
      ctx.body = "策略不存在";
      return;
    }
    if (ploy.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "策略不属于该账户";
      return;
    }

    ctx.body = ploy.keyId;
  } catch (err) {
    logger.error(
      `[错误][策略取KEY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
module.exports = router;
