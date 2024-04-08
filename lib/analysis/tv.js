const logger = require("../logger");
const config = require("../../config");
const getPosition = require("./getPosition");
const getAccount = require("./getAccount");

module.exports = async (obj) => {
  try {
    // 判断交易币种是期货还是现货 用正则表达式判断
    // if (obj.params.ticker.match(/.P$/) !== null) {
    //   //  期货
    // } else {
    //   //  现货
    // }

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
      !obj.params.comment
    ) {
      throw new Error("参数错误");
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
      bin_params.timeInForce = obj.bin.safe_tradeList[coin].timeInForce;
    }
    const PositionRes = getPosition(obj.params);

    // config.coins里面有没有obj.bin.markId,为空则添加
    if (config.coins[obj.bin.markId] === undefined) {
      config.coins[obj.bin.markId] = [];
    }

    const funActions = {
      开单: async () => {
        /* 开单操作 */
        if (config.coins[obj.bin.markId].length >= obj.bin.safe_num) {
          if (obj.bin.safe_tradeList[coin].split === false) {
            throw new Error("持仓数量超过限制");
          }
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
      },
      平单: async () => {
        /* 平单操作 */
        config.coins[obj.bin.markId] = config.coins[obj.bin.markId].filter(
          (item) => item !== coin,
        );
      },
      加仓: async () => {
        /* 加仓操作 */
        if (config.coins[obj.bin.markId].length >= obj.bin.safe_num) {
          if (!config.coins[obj.bin.markId].includes(coin)) {
            if (obj.bin.safe_tradeList[coin].split === false) {
              throw new Error("持仓数量超过限制");
            }
          }
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
        config.coins[obj.bin.markId].includes(coin)
          ? null
          : config.coins[obj.bin.markId].push(coin);
      },
      减仓: async () => {
        /* 减仓操作 */
      },
      多转空: async () => {
        /* 多转空操作 */
        obj.params.quantity = Number(Math.abs(obj.params.quantity));
        if (config.coins[obj.bin.markId].length >= obj.bin.safe_num) {
          if (!config.coins[obj.bin.markId].includes(coin)) {
            if (obj.bin.safe_tradeList[coin].split === false) {
              throw new Error("持仓数量超过限制");
            }
          }
        }
        // 更改杠杆
        await obj.bin.client
          .qer({
            id: obj.newKeyLog._id.toString(),
            method: "POST",
            url: "/fapi/v1/order",
            params: {
              symbol: obj.params.symbol,
              type: "MARKET",
              positionSide: "LONG",
              quantity: exchangeInfoSymbol.filters[2].maxQty,
              side: "SELL",
            },
            isPrivate: true,
          })
          .catch((err) => {
            if (err.code != -2022) {
              throw new Error("平仓失败");
            }
          });
      },
      空转多: async () => {
        /* 空转多操作 */
        //   平仓
        obj.params.quantity = Number(Math.abs(obj.params.quantity));
        if (config.coins[obj.bin.markId].length >= obj.bin.safe_num) {
          if (!config.coins[obj.bin.markId].includes(coin)) {
            if (obj.bin.safe_tradeList[coin].split === false) {
              throw new Error("持仓数量超过限制");
            }
          }
        }
        // 更改杠杆
        await obj.bin.client
          .qer({
            id: newKeyLog._id.toString(),
            method: "POST",
            url: "/fapi/v1/order",
            params: {
              symbol: params.symbol,
              type: "MARKET",
              positionSide: "SHORT",
              quantity: exchangeInfoSymbol.filters[2].maxQty,
              side: "BUY",
            },
            isPrivate: true,
          })
          .catch((err) => {
            if (err.code != -2022) {
              throw new Error("平仓失败");
            }
          });
      },
    };
    // throw new Error("方法错误");
    if (funActions.hasOwnProperty(PositionRes.actionsType)) {
      await funActions[PositionRes.actionsType]();
    } else {
      // 处理未知操作
      throw new Error("方法错误");
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
    // 获取账户信息-同步仓位信息
    await getAccount(obj.bin);
    logger.info(
      `[${obj.newKeyLog._id}][ANALYSIS][TV][${PositionRes.actionsType}][交易完成] ${JSON.stringify(obj.params)} > ${JSON.stringify(bin_result)}`,
    );
  } catch (err) {
    logger.error(
      `[错误][${obj.newKeyLog._id}][ANALYSIS][TV][${err.message}] > ${JSON.stringify(obj.params)}`,
    );
    logger.error(err);
    obj.newKeyLog.bin_result = err.message;
    obj.newKeyLog.update_time = Date.now();
    await obj.newKeyLog.save();
  }
};
