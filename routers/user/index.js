const koaRouter = require("koa-router");

const routerReg = require("./reg");
const routerLogin = require("./login");
const routerRefresh = require("./refresh");
const routerInfo = require("./info");
const logger = require("../../lib/logger");

const router = new koaRouter();

router.use(async (ctx, next) => {
  logger.trace(
    `[WEB][${ctx.getIp}][${ctx.request.url}] > ${JSON.stringify(ctx.request.body)} `,
  );
  await next();
});

router.use("/reg", routerReg.routes(), routerReg.allowedMethods());
router.use("/login", routerLogin.routes(), routerLogin.allowedMethods());
router.use("/refresh", routerRefresh.routes(), routerRefresh.allowedMethods());
router.use("/info", routerInfo.routes(), routerInfo.allowedMethods());

module.exports = router;
