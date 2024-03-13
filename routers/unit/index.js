const koaRouter = require("koa-router");

const tokenVerify = require("../../controllers/tokenVerify");

const router = new koaRouter();

router.use(tokenVerify);

module.exports = router;
