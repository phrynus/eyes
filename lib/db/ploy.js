const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 用户ID
  userId: String,
  // keyID
  keyId: Object,
  // 安全模式 - 开启交易
  safe_trade: Boolean,
});
module.exports = init.model("ploy", schema);
