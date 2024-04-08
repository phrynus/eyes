const koaRouter = require("koa-router");
const router = new koaRouter();

const routerPond = require("./pond");

router.use("/pond", routerPond.routes(), routerPond.allowedMethods());

module.exports = router;
