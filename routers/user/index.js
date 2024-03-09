const koaRouter = require("koa-router");

const router = new koaRouter();

router.get("/", async (ctx) => {
  ctx.body = "USER Page";
});

module.exports = router;
