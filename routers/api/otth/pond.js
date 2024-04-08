const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const config = require("../../../config");

const router = new koaRouter();
router.post("/pond", async (ctx) => {
  ctx.body = config.otth.pond;
});
//破军池
router.post("/93dd377acbd5ad5a5bc847c7ca0d2094", async (ctx) => {
  try {
    config.otth.pond["93dd377acbd5ad5a5bc847c7ca0d2094"] = {
      name: "破军池",
      data: ctx.body,
    };
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][破军池] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
