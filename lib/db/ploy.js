const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 用户ID
  userId: {
    type: String,
    required: true,
  },
  // keyID
  keyId: {
    type: Array,
    default: [],
  },
  // 标记ID
  markId: {
    type: String,
    required: true,
  },
  // 名称
  name: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  // 描述
  desc: {
    type: String,
  },
  // 安全模式 - 开启交易
  safe_trade: {
    type: Boolean,
    default: true,
  },
});
module.exports = init.model("ploy", schema);
