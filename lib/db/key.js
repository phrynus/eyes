const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 用户ID
  userId: {
    type: String,
    required: true,
  },
  // 标记ID
  markId: {
    type: String,
    required: true,
  },
  // 观摩ID
  seeId: {
    type: String,
    required: true,
  },
  // 策略ID
  ployId: {
    type: Object,
    default: {},
  },
  // 名称
  name: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  // 交易所
  exchange: {
    type: String,
    required: true,
    match: /^[binance]*$/,
  },
  // KEY
  key: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9]{20,100}$/,
  },
  // 密钥
  secret: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9]{20,100}$/,
  },
  // 密码
  password: {
    type: String,
    match: /^[a-zA-Z0-9]{1,100}$/,
  },
  // 安全模式 - 交易名单
  safe_tradeList: {
    type: Object,
    default: {
      BTCUSDT: {
        // 杠杆倍数
        lever: 1,
        // 分仓
        split: false,
        // 必须交易
        must: false,
        // 交易类型
        type: "MARKET",
      },
    },
  },
  // 安全模式 - 持仓数量
  safe_num: {
    type: Number,
    default: 0,
  },
  // 安全模式 - 开启交易
  safe_trade: {
    type: Boolean,
    default: true,
  },
});
module.exports = init.model("key", schema);
