const init = require("./init");
module.exports = init.model("ploy", {
  // 用户ID
  userId: String,
  // keyID
  keyId: Object,
  // 安全模式 - 开启交易
  safe_trade: Boolean,
});
