const koaRouter = require("koa-router");
const routerKey = require("./key");
const routerPloy = require("./ploy");

const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.use(tokenVerify);

router.use("/key", routerKey.routes(), routerKey.allowedMethods());
router.use("/ploy", routerPloy.routes(), routerPloy.allowedMethods());

module.exports = router;
