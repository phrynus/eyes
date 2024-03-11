const koaRouter = require("koa-router");
const db = require("../../lib/db");
const config = require("../../config");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const logger = require("../../lib/logger");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const { name, totp } = ctx.request.body;
    const user = await db.User.findOne({ name }).exec();
    if (!user) {
      ctx.status = 400;
      ctx.body = "用户不存在";
      return;
    }
    const userTotp = user.totp;
    const tokenValidates = speakeasy.totp.verify({
      secret: userTotp.base32,
      encoding: "base32",
      token: Number(totp),
      window: 1,
    });

    if (!tokenValidates) {
      ctx.status = 400;
      ctx.body = "动态口令错误";
      return;
    }
    // 更新登录时间与ip
    await db.User.updateOne(
      { _id: user._id },
      {
        $set: {
          login_ip: ctx.getIp,
          login_at: new Date(),
        },
      },
    );
    // 生成令牌
    const accessToken = jwt.sign(
      { userName: user.name, userId: user._id },
      config.tokenAccessSecret,
      {
        expiresIn: "1h",
      },
    );
    const refreshToken = jwt.sign(
      { userName: user.name, userId: user._id },
      config.tokenRefreshSecret,
      {
        expiresIn: "7d",
      },
    );

    const key = await db.Key.find(
      { userId: user._id },
      { name: 1, ployId: 1, markId: 1, seeId: 1, exchange: 1, _id: 0 },
    ).exec();
    key.forEach((item) => {
      item.ployId.map(
        (v) => {
          delete v._id;
        },
        { userId: 0, _id: 0, __v: 0 },
      );
    });

    ctx.body = {
      name: user.name,
      token: {
        accessToken,
        refreshToken,
      },
      key,
    };
  } catch (err) {
    logger.error(
      `[错误][登录] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 404;
    ctx.body = err.message;
  }
});
// 写一个刷新令牌

module.exports = router;
