const koa = require("koa");
const koaRouter = require("koa-router");
const koaBody = require("koa-bodyparser");

const routerTrade = require("./trade");
const routerUser = require("./user");
const routerApi = require("./api");
const routerUnit = require("./unit");
const logger = require("../lib/logger");

const app = new koa();
const router = new koaRouter();

app.use(koaBody());

app.use(async (ctx, next) => {
  ctx.getIp = (ctx.get("X-Forwarded-For") || ctx.get("x-real-ip") || ctx.ip)
    .replace(/:\d+$/, "")
    .replace(/::ffff:/, "");
  logger.trace(
    `[WEB][${ctx.getIp}][${ctx.request.url}] > ${JSON.stringify(ctx.request.body)} `,
  );
  await next();
});

router.use("/trade", routerTrade.routes(), routerTrade.allowedMethods());
router.use("/user", routerUser.routes(), routerUser.allowedMethods());
router.use("/api", routerApi.routes(), routerApi.allowedMethods());
router.use("/unit", routerUnit.routes(), routerUnit.allowedMethods());
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    ctx.status = 404;
    ctx.body = "Copyright © 2024 Phrynus GitHub All Rights Reserved."; // "Not Found
  }
});

app.use(router.routes());

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// })
module.exports = app;
