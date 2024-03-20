const db = require("../lib/db");
const client = require("../lib/client");
const config = require("../config");
const axios = require("axios");

module.exports = async function () {
  try {
    // 初始化交易所 - 币安
    await axios(config.bin.binance.baseUrl + "/fapi/v1/time")
      .then((res) => {
        config.bin.binance.timeOffset =
          res.data.serverTime - new Date().getTime();
      })
      .catch((err) => {
        throw err.response?.data || err.message;
      });
    await axios(config.bin.binance.baseUrl + "/fapi/v1/exchangeInfo")
      .then((res) => {
        config.bin.binance.exchangeInfo = res.data || {};
      })
      .catch((err) => {
        throw err.response?.data || err.message;
      });
    // 初始化交易所
    const keys = await db.Key.find();
    for (const key of keys) {
      let c = null;
      if (key.exchange === "binance") {
        c = new client.Binance({
          baseUrl: config.bin.binance.baseUrl,
          key: key.key,
          secret: key.secret,
          maxRetries: 5,
          retryDelay: 200,
          timeOffset: config.bin.binance.timeOffset,
        });
      }
      config.bin[key.markId] = {
        ...key._doc,
        coins: [],
        client,
      };
    }
    // console.log(config.bin);
    return true;
  } catch (err) {
    throw err;
  }
};
