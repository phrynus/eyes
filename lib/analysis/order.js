const logger = require("../logger");
const config = require("../../config");

module.exports = async (obj) => {
  try {
    if (
      !obj.params.symbol ||
      !obj.params.position ||
      !obj.params.side ||
      !obj.params.quantity ||
      obj.bin.safe_tradeList[coin].type === "LIMIT"
        ? !obj.params.price
        : false
    ) {
      throw new Error("参数错误");
    }
    let coin = obj.params.symbol;
    if (!obj.bin.safe_tradeList[coin]) {
      throw new Error("不在白名单：" + coin);
    }
    // 获取交易对的交易所信息
    const exchangeInfoSymbol = config.bin.binance.exchangeInfo.symbols.find(
      (item) => item.symbol === coin,
    );
    const minQty = Number(exchangeInfoSymbol.filters[1].minQty); // 最小交易数量
    const maxQty = Number(exchangeInfoSymbol.filters[1].maxQty); // 最大交易数量
    const minPrice = Number(exchangeInfoSymbol.filters[0].minPrice); // 最小交易价格
    const maxPrice = Number(exchangeInfoSymbol.filters[0].maxPrice); // 最大交易价格
    // 市价订单价格限制
    const MARKET_maxQty = Number(exchangeInfoSymbol.filters[2].maxQty);
    const MARKET_minQty = Number(exchangeInfoSymbol.filters[2].minQty);

    if (obj.bin.safe_tradeList[coin].type === "MARKET") {
      // 市价单
      if (
        MARKET_maxQty < Number(obj.params.quantity) ||
        MARKET_minQty > Number(obj.params.quantity)
      ) {
        throw new Error("数量限制");
      }
    } else {
      // 检查数量和价格是否在有效范围内
      if (
        minQty > Number(obj.params.quantity) ||
        maxQty < Number(obj.params.quantity)
      ) {
        throw new Error("数量限制");
      }
      // 检查数量和价格是否在有效范围内
      if (
        minPrice > Number(obj.params.price) ||
        maxPrice < Number(obj.params.price)
      ) {
        throw new Error("价格限制");
      }
    }
    const bin_params = {
      symbol: coin,
      type: obj.bin.safe_tradeList[coin].type,
      positionSide: obj.params.position,
      // side: obj.params.side,
      quantity: Number(obj.params.quantity).toFixed(
        exchangeInfoSymbol.quantityPrecision,
      ),
      timestamp: null,
    };
    // 如果是限价单，设置价格和有效期
    if (obj.bin.safe_tradeList[coin].type === "LIMIT") {
      bin_params.price = Number(obj.params.price).toFixed(
        exchangeInfoSymbol.pricePrecision,
      );
      bin_params.timeInForce = obj.bin.safe_tradeList[coin].timeInForce;
    }
    //
    if (config.coins[obj.bin.markId] === undefined) {
      config.coins[obj.bin.markId] = [];
    }
    if (obj.params.side === "OPEN") {
      bin_params.side = obj.params.position === "LONG" ? "BUY" : "SELL";
      if (config.coins[obj.bin.markId].length >= obj.bin.safe_num) {
        throw new Error("持仓数量超过限制");
      }
      // 更改杠杆
      obj.bin.client.qer({
        id: obj.newKeyLog._id.toString(),
        method: "POST",
        url: "/fapi/v1/leverage",
        params: {
          symbol: coin,
          leverage: obj.bin.safe_tradeList[coin].lever,
        },
        isPrivate: true,
      });
      // obj.bin.coins里面添加coin，如果重复则不添加
      config.coins[obj.bin.markId].includes(coin)
        ? null
        : config.coins[obj.bin.markId].push(coin);
    } else if (obj.params.side === "CLOSE") {
      bin_params.side = obj.params.position === "LONG" ? "SELL" : "BUY";
      bin_params.quantity = exchangeInfoSymbol.filters[2].maxQty;
      obj.bin.coins.filter((item) => item !== coin);
    } else if (obj.params.side === "OPEN") {
      bin_params.side = obj.params.position === "LONG" ? "BUY" : "SELL";
      obj.bin.client.qer({
        id: obj.newKeyLog._id.toString(),
        method: "POST",
        url: "/fapi/v1/leverage",
        params: {
          symbol: obj.params.symbol,
          leverage: obj.bin.safe_tradeList[coin].Lever,
        },
        isPrivate: true,
      });
      config.coins[obj.bin.markId].includes(coin)
        ? null
        : config.coins[obj.bin.markId].push(coin);
    } else if (obj.params.side === "DECR") {
      bin_params.side = obj.params.position === "LONG" ? "SELL" : "BUY";
    }

    const bin_result = await obj.bin.client.qer({
      id: obj.newKeyLog._id.toString(),
      method: "POST",
      url: "/fapi/v1/order",
      params: bin_params,
      isPrivate: true,
    });
    obj.newKeyLog.bin_params = bin_params;
    obj.newKeyLog.bin_result = bin_result;
    obj.newKeyLog.update_time = Date.now();
    obj.newKeyLog.save();
    logger.info(
      `[${obj.newKeyLog._id}][ANALYSIS][ORDER][交易完成] ${JSON.stringify(obj.params)} > ${JSON.stringify(bin_result)}`,
    );

    //
  } catch (err) {
    logger.error(
      `[错误][${obj.newKeyLog._id}][ANALYSIS][ORDER][${err.message}] > ${JSON.stringify(obj.params)}`,
    );
    logger.error(err);
    obj.newKeyLog.bin_result = err.message;
    obj.newKeyLog.update_time = Date.now();
    await obj.newKeyLog.save();
  }
};
