const config = require("../config");
const jwt = require("jsonwebtoken");
module.exports = async (ctx, next) => {
  const token = ctx.headers["authorization"];
  if (!token) {
    ctx.status = 403;
    return;
  }
  try {
    ctx.user = jwt.verify(token, config.tokenAccessSecret);
    await next();
  } catch (err) {
    ctx.status = 401;
  }
};
