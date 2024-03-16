const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");

const router = new koaRouter();
router.post("/ploy/:markId", async (ctx) => {
  try {
    ctx.body = "";
  } catch (e) {}
});
router.post("/:markId", async (ctx) => {
  try {
    ctx.body = "";
  } catch (e) {}
});

module.exports = router;
