const koaRouter = require("koa-router");
const routerKey = require("./key");
const routerPloy = require("./ploy");
const logger = require("../../lib/logger");

const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.use(tokenVerify);
router.use(async (ctx, next) => {
  logger.trace(
    `[WEB][${ctx.getIp}][${ctx.request.url}] > ${JSON.stringify(ctx.request.body)} `,
  );
  await next();
});

router.use("/key", routerKey.routes(), routerKey.allowedMethods());
router.use("/ploy", routerPloy.routes(), routerPloy.allowedMethods());

module.exports = router;
