const init = require("./init");
// Compare this snippet from lib/db/key.js:
module.exports = init.model("key", {
  // 用户ID
  userId: String,
  // 标记ID
  markId: String,
  // 观摩ID
  seeId: String,
  // 名称
  name: String,
  // 交易所
  exchange: String,
  // KEY
  key: String,
  // 密钥
  secret: String,
  // 密码
  password: String,
  // 安全模式 - 持仓数量
  safe_num: Number,
  // 安全模式 - 必持仓币种
  safe_symbol: Object,
  // 安全模式 - 自动转为全仓
  safe_full: Boolean,
  // 安全模式 - 自动转为双向持仓
  safe_both: Boolean,
  // 安全模式 - 开启交易
  safe_trade: Boolean,
});
