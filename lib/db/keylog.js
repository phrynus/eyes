const init = require("./init");
const { Schema } = require("mongoose");
const escapeHtml = require("escape-html");
const schema = new Schema({
  userName: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  keyName: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  symbol: {
    type: String,
    required: true,
    match: /^[\w\d\.]{1,16}$/,
  },
  position: {
    type: String,
  },
  action: {
    type: String,
  },
  comment: {
    type: String,
    default: "",
  },
  params: {
    type: Object,
    default: {},
  },
  bin_params: {
    type: Object,
    default: {},
  },
  bin_result: {
    type: Object,
    default: {},
  },
  // 接收时间
  time: {
    type: Date,
    default: Date.now,
  },
  //   更新时间
  update_time: {
    type: Date,
    default: Date.now,
  },
});
module.exports = init.model("KeyLog", schema);
