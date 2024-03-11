const koaRouter = require("koa-router");
const db = require("../../lib/db");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const logger = require("../../lib/logger");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const { refreshToken } = ctx.request.body;
    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = "参数错误";
      return;
    }
    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, config.tokenRefreshSecret);
    await db.User.updateOne(
      { _id: decoded.userId },
      {
        $set: {
          login_ip: ctx.getIp,
          login_at: new Date(),
        },
      },
    );
    ctx.body = jwt.sign(
      { userName: decoded.userName, userId: decoded.userId },
      config.tokenAccessSecret,
      { expiresIn: "1h" },
    );
  } catch (err) {
    ctx.status = 403;
    ctx.body = err.message;
  }
});

module.exports = router;
