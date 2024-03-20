const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");
const routerKey = require("./key");
const router = new koaRouter();

router.post("/add", async (ctx) => {
  try {
    const { name } = ctx.request.body;
    // 判断参数
    if (!name) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    const usernameRegex = /^[\u4e00-\u9fa5\w\d]{3,16}$/;
    if (!name || !usernameRegex.test(name)) {
      ctx.status = 400;
      ctx.body = "名称必须由3到16个字符组成，只能包含字母、数字、下划线、中文";
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
      keyId: {},
      // 名称
      name,
    });
    await newPloy.save();
    ctx.body = {
      name: newPloy.name,
      _id: newPloy._id,
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
    const key = await db.Key.findOne({ _id: ploy.keyId[i] });
    // 删除策略
    delete key.ployId[ployId];
    await db.Ploy.updateOne(
      { _id: ploy._id },
      {
        $set: {
          keyId: ploy.keyId,
        },
      },
    );

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
