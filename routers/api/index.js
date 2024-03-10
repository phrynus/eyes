const koaRouter = require("koa-router");
const routerKey = require("./key");

const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.use(tokenVerify);

router.use("/key", routerKey.routes(), routerKey.allowedMethods());

module.exports = router;
