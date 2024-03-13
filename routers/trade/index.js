const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");
const config = require("../../config");

const routerPloy = require("./ploy");
const routerTV = require("./tv");
const routerOrder = require("./order");

const router = new koaRouter();

router.use("/ploy", routerPloy.routes(), routerPloy.allowedMethods());
router.use("/tv", routerTV.routes(), routerTV.allowedMethods());
router.use("/binOrder", routerOrder.routes(), routerOrder.allowedMethods());

module.exports = router;
