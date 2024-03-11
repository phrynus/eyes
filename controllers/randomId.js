const crypto = require("crypto");
module.exports = (...data) => {
  const dataString = data.join("");
  const hash = crypto.createHash("md5");
  hash.update(dataString);
  return hash.digest("hex");
};
