const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 用户ID
  userId: String,
  // keyID
  keyId: Object,
  // 标记ID
  markId: String,
  // 名称
  name: String,
  // 描述
  desc: String,
  // 安全模式 - 开启交易
  safe_trade: Boolean,
});
module.exports = init.model("ploy", schema);
