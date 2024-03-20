const config = require("../../config");
module.exports = async (bin) => {
  const response = await bin.client.qer({
    id: "数据同步",
    method: "GEt",
    url: "/fapi/v2/account",
    params: {},
    isPrivate: true,
  });
  response.positions = response.positions.filter(
    (pos) => Number(pos.positionInitialMargin) > 0,
  );
  config.coins[bin.markId] = response.positions.map((pos) => pos.symbol);
};
