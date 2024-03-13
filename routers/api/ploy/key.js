const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");

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
    const ploy = await db.Ploy.findOne({ _id: ployId });
    if (!key || !ploy) {
      ctx.status = 400;
      ctx.body = "KEY或策略不存在";
      return;
    }
    // 判断KEY是否已经添加
    if (ploy.keyId.includes(key._id.toString())) {
      ctx.status = 400;
      ctx.body = "KEY已经添加";
      return;
    }
    // 判断KEY数量
    if (ploy.keyId.length >= 5) {
      ctx.status = 400;
      ctx.body = "策略KEY数量已达上限";
      return;
    }
    // id转成字符串
    ploy.keyId.push(key._id.toString());
    await db.Ploy.updateOne(
      { _id: ploy._id },
      {
        $set: {
          keyId: ploy.keyId,
        },
      },
    );
    key.ployId.push(ploy._id.toString());
    await db.Key.updateOne(
      { _id: key._id },
      {
        $set: {
          ployId: key.ployId,
        },
      },
    );

    for (let j = 0; j < ploy.keyId.length; j++) {
      let key = await db.Key.findOne({ _id: ploy.keyId[j] });
      let user = await db.User.findOne({ _id: key.userId });
      ploy.keyId[j] = {
        key: key._id,
        keyName: key.name,
        keyUser: user.name,
      };
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
    // 删除策略
    key.ployId = key.ployId.filter((item) => item !== ployId);
    await db.Key.updateOne(
      {
        _id: key._id,
      },
      {
        $set: {
          ployId: key.ployId,
        },
      },
    );
    for (let j = 0; j < ploy.keyId.length; j++) {
      let key = await db.Key.findOne({ _id: ploy.keyId[j] });
      let user = await db.User.findOne({ _id: key.userId });
      ploy.keyId[j] = {
        key: key._id,
        keyName: key.name,
        keyUser: user.name,
      };
    }
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

    for (let j = 0; j < ploy.keyId.length; j++) {
      let key = await db.Key.findOne({ _id: ploy.keyId[j] });
      let user = await db.User.findOne({ _id: key.userId });
      ploy.keyId[j] = {
        key: key._id,
        keyName: key.name,
        keyUser: user.name,
      };
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
