const routers = require("./routers");
const init = require("./controllers/init");
const config = require("./config");

(async () => {
  try {
    await init().catch((err) => {
      throw err;
    });
    routers.listen(config.port, async () => {
      console.log("http://127.0.0.1:" + config.port);
    });
  } catch (e) {
    console.log(e);
    console.log("启动失败");
  }
})();
