const mongoose = require("mongoose");
const logger = require("../logger");
mongoose
  .connect("mongodb://eyes:pnX8YNe5m6DiNx6f@103.143.72.237:27017/eyes")
  .catch((err) => {
    logger.error(`[mongoose] 数据库连接失败: ${err}`);
  });
module.exports = mongoose;
