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
      {
        userId: 0,
        key: 0,
        secret: 0,
        password: 0,
        __v: 0,
      },
    ).exec();

    const ploy = await db.Ploy.find(
      {
        userId: user._id,
      },
      { userId: 0, __v: 0 },
    ).exec();

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
