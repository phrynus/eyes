const routers = require("./routers");
const client = require("./lib/client");
const config = require("./config");

(() => {
  routers.listen(config.port, async () => {
    console.log("http://127.0.0.1:" + config.port);
    // const binance = new client.Binance({
    //   baseUrl: "https://fapi.phrynus.cn",
    //   key: "3nEtXDHjuh17C5STHZD0YEXHDHdwjCfzM5Zo2cz6a3yihAtoMQAOzEUk5TAkhOwW",
    //   secret:
    //     "j6nDoF5qO7TGcCfZJHbVHcAv2ikJ5OEKDpF1bydIH3WQqcnvrwskWTiWBo4ByKo4",
    //   timeOffset: 0,
    // });
    // let binanceMethod = new client.BinanceMethod("1709478611", binance);
    // let time = await binanceMethod.changeLeverage("BTCUSDT", 20).catch((e) => {
    //   return e;
    // });
    // console.log(time);
    //
    // binanceMethod = null;
  });
})();
