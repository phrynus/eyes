const koaRouter = require("koa-router");
const db = require("../../lib/db");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const logger = require("../../lib/logger");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const { name } = ctx.request.body;
    //用于验证用户名的正则表达式
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!name || !usernameRegex.test(name)) {
      ctx.status = 400;
      ctx.body =
        "参数错误，用户名必须由3到16个字符组成，只能包含字母、数字、下划线";
      return;
    }
    //检查用户名或IP是否已存在
    const existingUser = await db.User.findOne({ name });
    const existingUsersWithSameIp = await db.User.find({
      create_ip: ctx.getIp,
    });
    if (existingUser || existingUsersWithSameIp.length > 2) {
      ctx.status = 400;
      ctx.body = "用户名已存在或者IP注册次数过多";
      return;
    }
    // 创建用户
    // Generate TOTP secret and save user
    const totpSecret = speakeasy.generateSecret({
      length: 20,
      name: `EYES:${name}`,
    });
    const newUser = new db.User({
      name,
      totp: totpSecret,
      login_ip: ctx.getIp,
      login_at: new Date(),
      create_ip: ctx.getIp,
      create_at: new Date(),
    });

    //
    await newUser.save();
    logger.info(`[注册] ${JSON.stringify(newUser)}`);
    ctx.body = await qrcode.toDataURL(totpSecret.otpauth_url);
  } catch (err) {
    logger.error(
      `[错误][注册] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);

    ctx.status = 404;
    ctx.body = err.message;
  }
});

module.exports = router;
