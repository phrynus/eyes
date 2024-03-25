module.exports = {
  // 端口
  port: 3000,
  // 交易所信息
  bin: {
    binance: {
      baseUrl: "https://fapi.phrynus.cn",
      timeOffset: 0,
      exchangeInfo: {},
    },
  },
  whitelist: [
    "::ffff:127.0.0.1",
    "::ffff:-1",
    "127.0.0.1",
    // TV的IP
    "52.89.214.238",
    "34.212.75.30",
    "54.218.53.128",
    "52.32.178.7",
  ],
  safeRepeatList: [],
  key: {},
  coins: {},
  unit: {},
  // Token 密钥
  tokenAccessSecret: "CC33B52ED2C058F505DC3BFD6B7AA32F",
  tv: {
    // 交易所：交易品种
    ticker: "{{ticker}}",
    // 持仓方向 LONG SHORT
    market_position: "{{strategy.market_position}}", //{{strategy.market_position}} - 以字符串形式返回策略的当前位置：“long”、“flat”、或 “short”。如果是“flat”，使用上一个位置的方向。
    prev_market_position: "{{strategy.prev_market_position}}", //{{strategy.prev_market_position}} - 以字符串形式返回策略的上一个位置：“long”、“flat”、或 “short”。如果是“flat”，也为。
    // 交易类型
    action: "{{strategy.order.action}}", //{{strategy.order.action}} - 为执行的订单返回字符串“buy”或“sell”。
    // 执行完后的数量
    position_size: "{{strategy.position_size}}", //返回Pine中相同关键字的值，即当前位置的大小。如果没有持仓，返回0。如果是多头持仓，返回正数。如果是空头持仓，返回负数。
    market_position_size: "{{strategy.market_position_size}}", //以绝对值（即非负数）的形式返回当前仓位的大小。
    prev_market_position_size: "{{strategy.prev_market_position_size}}", //以绝对值（即非负数）的形式返回前一个仓位的大小。
    // 交易数量
    contracts: "{{strategy.order.contracts}}",
    // 交易价格
    price: "{{strategy.order.price}}",
    // 注释
    comment: "{{strategy.order.comment}}",
  },
  order: {
    symbol: "BTCUSDT",
    type: "MARKET、LIMIT",
    positionSide: "LONG、SHORT",
    side: "OPEN、CLOSE、INCR、DECR",
    quantity: 1.2,
    price: 70000,
  },
};
