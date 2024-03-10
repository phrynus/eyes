const koaRouter = require("koa-router");

const router = new koaRouter();

router.post("/", async (ctx) => {
  ctx.body = "USER API Page";
});

module.exports = router;
