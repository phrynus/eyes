const logger = require("../logger");
const client = require("../client");
module.exports = async ({
  newKeyLog,
  bin,
  params,
  PositionRes,
  exchangeInfoSymbol,
}) => {
  try {
    logger.info(
      `[ORDER][Binance][${PositionRes.tradeType}][${newKeyLog._id}] ${JSON.stringify(params)}`,
    );
    // console.log(bin, key);
    const funActions = {
      开单: async () => {
        /* 开单操作 */
        const response = await bin.client.qer({
          id: newKeyLog._id.toString(),
          method: "GEt",
          url: "/fapi/v2/account",
          params: {},
          isPrivate: true,
        });
        let positionList = response.positions.filter(
          (pos) => Number(pos.positionInitialMargin) > 0,
        );
        if (positionList.length >= bin.safe_num) {
          throw new Error("持仓数量超过限制");
        }
        // 更改杠杆
        bin.client.qer({
          id: newKeyLog._id.toString(),
          method: "POST",
          url: "/fapi/v1/leverage",
          params: {
            symbol: params.symbol,
            leverage: bin.safe_tradeList[params.symbol].Lever,
          },
          isPrivate: true,
        });
      },
      平单: async () => {
        /* 平单操作 */
      },
      加仓: async () => {
        /* 加仓操作 */
        bin.client.qer({
          id: newKeyLog._id.toString(),
          method: "POST",
          url: "/fapi/v1/leverage",
          params: {
            symbol: params.symbol,
            leverage: bin.safe_tradeList[params.symbol].Lever,
          },
          isPrivate: true,
        });
      },
      减仓: async () => {
        /* 减仓操作 */
      },
      多转空: async () => {
        /* 多转空操作 */
        params.quantity = Number(Math.abs(params.quantity));
        await bin.client
          .qer({
            id: newKeyLog._id.toString(),
            method: "POST",
            url: "/fapi/v1/order",
            params: {
              symbol: params.symbol,
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
        params.quantity = Number(Math.abs(params.quantity));
        await bin.client
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
    if (funActions.hasOwnProperty(PositionRes.actionsType)) {
      await funActions[PositionRes.actionsType]();
    } else {
      // 处理未知操作
      logger.error(
        `[错误][ORDER][Binance][${PositionRes.tradeType}][${newKeyLog._id}] ${JSON.stringify(params)}`,
      );
    }
    const bin_result = await bin.client.qer({
      id: newKeyLog._id.toString(),
      method: "POST",
      url: "/fapi/v1/order/test",
      params,
      isPrivate: true,
    });
    newKeyLog.bin_params = params;
    newKeyLog.bin_result = bin_result;
    newKeyLog.update_time = Date.now();
    newKeyLog.save();
    //
  } catch (err) {
    logger.error(
      `[错误][ORDER][Binance][${PositionRes.tradeType}][${err.message}][${newKeyLog._id}] > ${JSON.stringify(params)}`,
    );
    logger.error(err);
    newKeyLog.bin_result = err.message;
    newKeyLog.update_time = Date.now();
    await newKeyLog.save();
  }
};
