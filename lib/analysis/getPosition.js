module.exports = (params) => {
  let tradeType = "";
  let actionsType = "";
  if (params.market_position === "long") {
    // 多单
    if (params.prev_market_position === "flat") {
      if (params.action === "buy") {
        tradeType = "多开单";
        actionsType = "开单";
      }
    } else if (
      params.prev_market_position === "short" &&
      params.action === "buy"
    ) {
      tradeType = "空转多";
      actionsType = "空转多";
    } else if (params.prev_market_position === "long") {
      if (params.action === "buy") {
        tradeType = "多加仓";
        actionsType = "加仓";
      } else if (params.action === "sell") {
        tradeType = "多减仓";
        actionsType = "减仓";
      }
    }
  } else if (params.market_position === "short") {
    // 空单
    if (params.prev_market_position === "flat") {
      if (params.action === "sell") {
        tradeType = "空开单";
        actionsType = "开单";
      }
    } else if (
      params.prev_market_position === "long" &&
      params.action === "sell"
    ) {
      tradeType = "多转空";
      actionsType = "多转空";
    } else if (params.prev_market_position === "flat") {
      if (params.action === "sell") {
        tradeType = "空加仓";
        actionsType = "加仓";
      } else if (params.action === "buy") {
        tradeType = "空减仓";
        actionsType = "减仓";
      }
    }
  } else if (params.market_position === "flat") {
    if (
      params.prev_market_position === "long" &&
      params.action === "sell" &&
      params.position_size === "0"
    ) {
      tradeType = "多平单";
      actionsType = "平单";
    } else if (
      params.prev_market_position === "short" &&
      params.action === "buy" &&
      params.position_size === "0"
    ) {
      tradeType = "空平单";
      actionsType = "平单";
    }
  }
  return {
    tradeType,
    actionsType,
  };
};
