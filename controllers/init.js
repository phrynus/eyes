const db = require("../lib/db");
const client = require("../lib/client");
const config = require("../config");
const axios = require("axios");

module.exports = async function () {
  try {
    // 初始化交易所 - 币安
    await axios(config.bin.binance.baseUrl + "/fapi/v1/time")
      .then((res) => {
        config.timeOffset = res.data.serverTime - new Date().getTime();
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

    let KeyData = await db.Key.find();
    for (let i = 0; i < KeyData.length; i++) {
      if (KeyData[i].status !== 1) continue;
      let binance = new client.Binance({
        baseUrl: config.bin.binance.baseUrl,
        key: KeyData[i].key,
        secret: KeyData[i].secret,
        timeOffset: config.timeOffset,
      });
    }

    return true;
  } catch (err) {
    throw err;
  }
};
//
// for (let i = 0; i < KeyData.length; i++) {
//   let binance = new client.Binance({
//     baseUrl: "https://fapi.phrynus.cn",
//     key: KeyData[i].key,
//     secret: KeyData[i].secret,
//     timeOffset: 0,
//   });
//
//   let binanceMethod = new client.BinanceMethod(KeyData[i].id, binance);
//   let time = binanceMethod.changeLeverage("BTCUSDT", 20).catch((e) => {
//     return e;
//   });
// }
