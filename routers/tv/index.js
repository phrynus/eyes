const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");
const config = require("../../config");

const ploy = require("./ploy");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
  } catch (e) {}
});

router.use("/ploy", ploy.routes(), ploy.allowedMethods());

module.exports = router;
