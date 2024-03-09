const init = require("./init");
// Compare this snippet from lib/db/key.js:
const model = init.model("user", {
  // 名称
  name: String,
  // TOTP
  totp: Object,
  // 登录IP
  login_ip: String,
  // 登录时间
  login_at: Date,
  // 创建IP
  create_ip: String,
  // 创建时间
  create_at: Date,
});
module.exports = model;
