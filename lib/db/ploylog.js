const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  userName: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  ployName: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  keyNames: {
    type: Array,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    match: /^[\w\d\.]{1,16}$/,
  },
  comment: {
    type: String,
    default: "",
  },
  params: {
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
module.exports = init.model("ploylog", schema);
