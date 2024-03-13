const init = require("./init");
const { Schema } = require("mongoose");
const schema = new Schema({
  // 名称
  name: {
    type: String,
    required: true,
    match: /^[\u4e00-\u9fa5\w\d]{1,16}$/,
  },
  // TOTP
  totp: Object,
  // vip
  vip: Boolean,
  // 到期时间
  vip_end: Date,
  // 登录IP
  login_ip: String,
  // 登录时间
  login_at: Date,
  // 创建IP
  create_ip: String,
  // 创建时间
  create_at: Date,
});
module.exports = init.model("user", schema);
