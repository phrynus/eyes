const koaRouter = require("koa-router");
const db = require("../../lib/db");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.post("/", tokenVerify, async (ctx) => {
  try {
    await db.User.updateOne(
      { _id: ctx.user.userId },
      {
        $set: {
          login_ip: ctx.getIp,
          login_at: new Date(),
        },
      },
    );
    ctx.body = jwt.sign(
      { userName: ctx.user.userName, userId: ctx.user.userId },
      config.tokenAccessSecret,
      { expiresIn: "1h" },
    );
  } catch (err) {
    ctx.status = 403;
    ctx.body = err.message;
  }
});

module.exports = router;
