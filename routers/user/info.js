const koaRouter = require("koa-router");
const db = require("../../lib/db");
const logger = require("../../lib/logger");

const LZString = require("lz-string");

const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.use(tokenVerify);

router.post("/", async (ctx) => {
  try {
    const user = await db.User.findOne({ name: ctx.user.userName });
    if (!user) {
      ctx.status = 400;
      ctx.body = "用户不存在";
      return;
    }
    await db.User.updateOne(
      { _id: user._id },
      {
        $set: {
          login_ip: ctx.getIp,
          login_at: new Date(),
        },
      },
    );
    const key = await db.Key.find(
      { userId: user._id },
      { name: 1, ployId: 1, markId: 1, seeId: 1, exchange: 1 },
    ).exec();

    // 根据key.ployId查询ploy.name
    for (let i = 0; i < key.length; i++) {
      for (let j = 0; j < key[i].ployId.length; j++) {
        let ploy = await db.Ploy.findOne({ _id: key[i].ployId[j] });
        let user = await db.User.findOne({ _id: ploy.userId });
        key[i].ployId[j] = {
          ploy: ploy._id,
          ployName: ploy.name,
          ployUser: user.name,
        };
      }
    }

    const ploy = await db.Ploy.find(
      {
        userId: user._id,
      },
      { userId: 0, __v: 0 },
    ).exec();
    // ploy.keyId查询key.name
    for (let i = 0; i < ploy.length; i++) {
      for (let j = 0; j < ploy[i].keyId.length; j++) {
        let key = await db.Key.findOne({ _id: ploy[i].keyId[j] });
        let user = await db.User.findOne({ _id: key.userId });
        ploy[i].keyId[j] = {
          key: key._id,
          keyName: key.name,
          keyUser: user.name,
        };
      }
    }

    ctx.body = {
      name: user.name,
      key,
      ploy,
    };
  } catch (err) {
    logger.error(
      `[错误][INFO] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
