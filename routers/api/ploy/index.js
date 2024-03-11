const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");
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
      markId: newPloy.markId,
    };
  } catch (err) {
    logger.error(
      `[错误][策略添加] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 404;
    ctx.body = err.message;
  }
});
router.post("/delete", async (ctx) => {
  try {
    const { markId } = ctx.request.body;
    if (!markId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    await db.Ploy.deleteOne({ markId });
    ctx.body = "删除成功";
  } catch (err) {
    logger.error(
      `[错误][策略删除] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 404;
    ctx.body = err.message;
  }
});
router.post("/addKey", async (ctx) => {
  try {
    const { keyMarkId, ployMarkId } = ctx.request.body;
    if (!keyMarkId || !ployMarkId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const key = await db.Key.findOne({ markId: keyMarkId });
    const ploy = await db.Ploy.findOne({ markId: ployMarkId });
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
      ctx.body = "KEY数量已达上限";
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
    ctx.body = "添加成功";
  } catch (err) {
    logger.error(
      `[错误][策略添加KEY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 404;
    ctx.body = err.message;
  }
});
router.post("/deleteKey", async (ctx) => {
  try {
    const { keyMarkId, ployMarkId } = ctx.request.body;
    if (!keyMarkId || !ployMarkId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const key = await db.Key.findOne({ markId: keyMarkId });
    const ploy = await db.Ploy.findOne({ markId: ployMarkId });
    if (!key || !ploy) {
      ctx.status = 400;
      ctx.body = "KEY或策略不存在";
      return;
    }
    // 删除KEY
    ploy.keyId = ploy.keyId.filter((item) => item !== key._id.toString());
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
    key.ployId = key.ployId.filter((item) => item !== ploy._id.toString());
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
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][策略删除KEY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 404;
    ctx.body = err.message;
  }
});
router.post("/keyGet", async (ctx) => {
  try {
    const { ployMarkId } = ctx.request.body;
    if (!ployMarkId) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const ploy = await db.Ploy.findOne({ markId: ployMarkId });
    if (!ploy) {
      ctx.status = 400;
      ctx.body = "策略不存在";
      return;
    }
    const key = await db.Key.find(
      { _id: ploy.keyId },
      { name: 1, markId: 1, _id: 0 },
    ).exec();
    // 根据key.nameID取用户name
    const keyName = [];
    for (let i = 0; i < key.length; i++) {
      const user = await db.User.findOne({
        keyId: key[i]._id,
      });
      keyName.push({
        name: key[i].name,
        markId: key[i].markId,
        userName: user.name,
      });
    }
    ctx.body = keyName;
  } catch (err) {}
});
module.exports = router;
