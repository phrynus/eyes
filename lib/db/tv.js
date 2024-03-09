const init = require("./init");
// Compare this snippet from lib/db/key.js:
module.exports = init.model("tv", {
  // 用户名称
  userName: String,
  // key名称
  keyName: String,
  // 交易代号
  tradeType: String,
  // symbol
  symbol: String,
  // 交易描述
  comment: String,
  // 接收
  params: Object,
  // 请求参数
  bin_params: Object,
  // bin返回参数
  bin_result: Object,
  // 创建时间
  create_at: Date,
  // 更新时间
  update_at: Date,
});
