const db = require("../db");
const order = require("../order");
const logger = require("../logger");
const config = require("../../config");
const getPosition = require("./getPosition");

module.exports = async (obj) => {
  try {
    // 判断交易币种是期货还是现货 用正则表达式判断
    if (obj.params.ticker.match(/.P$/) !== null) {
      //  期货
    } else {
      //  现货
    }
    // 判断obj.params里面的关键参数是否存在
    if (
      !obj.params.ticker ||
      !obj.params.prev_market_position ||
      !obj.params.market_position ||
      !obj.params.price ||
      !obj.params.position_size ||
      !obj.params.market_position_size ||
      !obj.params.prev_market_position_size ||
      !obj.params.contracts ||
      !obj.params.type ||
      !obj.params.comment
    ) {
      throw new Error("参数不全");
    }
    let coin = obj.params.ticker.split(".")[0];
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
    // 市价订单数量限制
    const MARKET_MAX_QTY = Number(exchangeInfoSymbol.filters[2].maxQty);
    // 市价订单价格限制
    const MARKET_maxQty = Number(exchangeInfoSymbol.filters[2].maxQty);
    const MARKET_minQty = Number(exchangeInfoSymbol.filters[2].minQty);

    if (obj.bin.safe_tradeList[coin].type === "MARKET") {
      // 市价单
      if (
        MARKET_maxQty < Number(obj.params.contracts) ||
        MARKET_minQty > Number(obj.params.price)
      ) {
        throw new Error("数量限制");
      } else {
        // 检查数量和价格是否在有效范围内
        if (
          minQty > Number(obj.params.contracts) ||
          maxQty < Number(obj.params.contracts)
        ) {
          throw new Error("数量限制");
        }
      }
    }

    // 检查数量和价格是否在有效范围内
    if (
      minPrice > Number(obj.params.price) ||
      maxPrice < Number(obj.params.price)
    ) {
      throw new Error("价格限制");
    }
    // 设置发送交易的参数
    const bin_params = {
      symbol: coin,
      type: obj.bin.safe_tradeList[coin].type,
      positionSide:
        obj.params.market_position === "flat"
          ? obj.params.prev_market_position.toUpperCase()
          : obj.params.market_position.toUpperCase(),
      side: obj.params.action.toUpperCase(),
      quantity: Number(obj.params.contracts).toFixed(
        exchangeInfoSymbol.quantityPrecision,
      ),
      timestamp: null,
    };
    // 如果是限价单，设置价格和有效期
    if (obj.bin.safe_tradeList[coin].type === "LIMIT") {
      bin_params.price = Number(obj.params.price).toFixed(
        exchangeInfoSymbol.pricePrecision,
      );
      bin_params.timeInForce = obj.params.timeInForce;
    }
    const PositionRes = getPosition(obj.params);

    if (obj.key.exchange === "binance") {
      await order.Binance({
        newKeyLog: obj.newKeyLog,
        bin: obj.bin,
        params: bin_params,
        PositionRes,
        exchangeInfoSymbol,
      });
    } else {
      throw new Error("交易所不支持");
    }
  } catch (err) {
    logger.error(
      `[错误][ANALYSIS][TV][addTrade]][${obj.newKeyLog._id}] ${err.message} > ${JSON.stringify(obj.params)}`,
    );
    logger.error(err);
    obj.newKeyLog.bin_result = err.message;
    obj.newKeyLog.update_time = Date.now();
    await obj.newKeyLog.save();
  }
};
