const koaRouter = require("koa-router");

const tokenVerify = require("../../controllers/tokenVerify");
const config = require("../../config");

const router = new koaRouter();

// router.use(tokenVerify);

router.post("/PGKGSMPI", async (ctx) => {
  try {
    const { id, data } = ctx.request.body;
    if (!id || !data) {
      ctx.status = 400;
      ctx.body = "required";
      return;
    }
    config.unit[id] = data;
    ctx.body = "ok";
  } catch (error) {
    ctx.status = 500;
    ctx.body = error.message;
  }
});

module.exports = router;
