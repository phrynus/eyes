const config = require("../config");
const jwt = require("jsonwebtoken");
const db = require("../lib/db");
module.exports = async (ctx, next) => {
  const token = ctx.headers["authorization"];
  if (!token) {
    ctx.status = 403;
    return;
  }
  try {
    ctx.user = jwt.verify(token, config.tokenAccessSecret);
    // await db.User.updateOne(
    //   { _id: ctx.user._id },
    //   {
    //     $set: {
    //       login_ip: ctx.getIp,
    //       login_at: new Date(),
    //     },
    //   },
    // );
    await next();
  } catch (err) {
    ctx.status = 401;
  }
};
