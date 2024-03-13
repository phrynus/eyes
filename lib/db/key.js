const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 用户ID
  userId: String,
  // 标记ID
  markId: String,
  // 观摩ID
  seeId: String,
  // 策略ID
  ployId: Object,
  // 策略倍数
  ployLever: Number,
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
  // 安全模式 - 交易名单
  safe_tradeList: Object,
  // 安全模式 - 必持仓币种
  safe_mustSymbol: Object,
  // 安全模式 - 持仓数量
  safe_num: Number,
  // 安全模式 - 自动转为双向持仓
  safe_both: Boolean,
  // 安全模式 - 大单拆分
  safe_split: Boolean,
  // 安全模式 - 开启交易
  safe_trade: Boolean,
});
module.exports = init.model("key", schema);
