const db = require('../lib/db');
const client = require('../lib/client');
const config = require('../config');
const axios = require('axios');

module.exports = async function (ID) {
  const key = await db.Key.findById(ID);
  let c = null;
  if (key.exchange === 'binance') {
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
    coins: config.bin[key.markId].coins || [],
    client: c,
  };
};
