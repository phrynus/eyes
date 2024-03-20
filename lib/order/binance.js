const logger = require("../logger");
const client = require("../client");
module.exports = async ({ bin, params }) => {
  try {
    console.log(bin, params);
    //
  } catch (err) {
    logger.error(
      `[错误][ORDER][Binance][${err.message}] > ${JSON.stringify(params)}`,
    );
    logger.error(err);
  }
};
