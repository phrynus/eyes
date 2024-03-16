const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");
const config = require("../../config");

const routerTV = require("./tv");
const routerOrder = require("./order");

const router = new koaRouter();

router.use(async (ctx, next) => {
  ctx.isIp = config.whitelist.indexOf(ctx.getIp);
  if (ctx.isIp === -1) {
    ctx.status = 403;

    return;
  }
  await next();
});

router.use(async (ctx, next) => {
  const time = new Date();
  const filteredTrades = config.safeRepeatList.filter(
    (trade) => time - new Date(trade.time) < 1000 * 10,
  );
  const hasRepeat = filteredTrades.some((trade) => {
    return JSON.stringify(trade.params) === JSON.stringify(ctx.request.body);
  });
  if (hasRepeat) {
    ctx.status = 500;
    ctx.body = "重复请求";
  } else {
    config.safeRepeatList.unshift({
      time: time.toISOString(),
      params: ctx.request.body,
    });
    if (config.safeRepeatList.length > 1000) {
      config.safeRepeatList.pop();
    }
    await next();
  }
});

router.use("/tv", routerTV.routes(), routerTV.allowedMethods());
router.use("/order", routerOrder.routes(), routerOrder.allowedMethods());

module.exports = router;
