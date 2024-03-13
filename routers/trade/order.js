const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");

const router = new koaRouter();
router.post("/", async (ctx) => {
  try {
    ctx.body = "";
  } catch (e) {}
});
router.post("/ploy", async (ctx) => {
  try {
    ctx.body = "";
  } catch (e) {}
});

module.exports = router;
