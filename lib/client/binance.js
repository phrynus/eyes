const axios = require("axios");
const crypto = require("crypto");
const logger = require("../logger");
const sleep = require("../sleep");

class Binance {
  constructor({ baseUrl, key, secret, maxRetries, retryDelay, timeOffset }) {
    if (key === false || secret === false) {
      throw new Error("API key and secret are required");
    }
    this.baseUrl = baseUrl || "https://fapi.binance.com";
    this.key = key || "";
    this.secret = secret || "";
    this.maxRetries = maxRetries || 10; // 最大重试次数
    this.retryDelay = retryDelay || 100; // 重试延迟时间（毫秒）
    this.timeOffset = timeOffset || 0; // 服务器时间与本地时间的偏移值
  }

  async _qer({ id, method, url, params, isPrivate = false }) {
    let retryCount = 0;
    const timeOn = new Date();
    const makeRequest = async () => {
      try {
        params.timestamp = Date.now() + (this.timeOffset || 0);
        const serialisedParams = Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        const signature = crypto
          .createHmac("sha256", this.secret)
          .update(serialisedParams)
          .digest("hex");
        const requestOptions = {
          method: method,
          url: `${this.baseUrl + url}?${serialisedParams}${isPrivate ? `&signature=${signature}` : ""}`,
          headers: {
            "X-MBX-APIKEY": this.key,
          },
          json: true, // 指定请求返回JSON格式的数据
          timeout: 1500, // 设置请求超时时间为5秒
        };
        // console.log(requestOptions);
        const response = await axios(requestOptions);

        logger.trace(
          `[${id}][Binance][响应][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params)}`,
        );
        return response.data;
      } catch (error) {
        if (retryCount < this.maxRetries) {
          if (error.response?.status === 400) {
            if (error.response?.data?.code === -1021) {
              // 服务器时间与本地时间的偏移
              retryCount++;
              logger.trace(
                `[${id}][Binance][重发][-1021][${new Date() - timeOn}ms][${url}] > ${error.response?.data?.msg}`,
              );
              return makeRequest(); // 递归调用，重试请求
            }
            logger.trace(
              `[${id}][Binance][响应][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params)}`,
            );
            return error.response.data;
          } else if (error.code === "ECONNABORTED") {
            // 请求超时，进行重试
            retryCount++;
            logger.trace(
              `[${id}][Binance][重发][超时][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params) || ""} ${error.message} ${JSON.stringify(error.response?.data)}`,
            );
            return makeRequest(); // 递归调用，重试请求
          } else if (error.response && error.response.status !== 200) {
            // 服务器暂时不可用，进行重试
            retryCount++;
            logger.trace(
              `[${id}][Binance][重发][${error.response.status}][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params) || ""} ${error.message} ${JSON.stringify(error.response?.data)}`,
            );
            await sleep(this.retryDelay);
            return makeRequest(); // 递归调用，重试请求
          }
        }
        logger.error(
          `[${id}][Binance][报错][${new Date() - timeOn}ms][${error.code}][${error.response?.data?.code || error.response?.status}][${url}] > ${JSON.stringify(params) || ""} ${error.message} ${JSON.stringify(error.response?.data)}`,
        );
        throw `[${id}][Binance][报错][${new Date() - timeOn}ms][${error.code}][${error.response?.data?.code || error.response?.status}][${url}] > ${JSON.stringify(params) || ""} ${error.message} ${JSON.stringify(error.response?.data)}`;
      }
    };
    return makeRequest();
  }
}

class BinanceMethod {
  constructor(id, bin) {
    this.id = id;
    this.bin = bin;
  }

  // 获取服务器时间
  getServerTime() {
    return this.bin._qer({
      id: this.id,
      method: "GET",
      url: "/fapi/v1/time",
      params: {},
    });
  }

  // 获取交易规则和交易对
  getExchangeInfo() {
    return this.bin._qer({
      id: this.id,
      method: "GET",
      url: "/fapi/v1/exchangeInfo",
      params: {},
    });
  }

  // 获取价格
  getPrice(symbol) {
    return this.bin._qer({
      id: this.id,
      method: "GET",
      url: "/fapi/v1/ticker/price",
      params: { symbol },
    });
  }

  // 获取账户信息
  getAccount() {
    return this.bin._qer({
      id: this.id,
      method: "GET",
      url: "/fapi/v1/account",
      params: {},
      isPrivate: true,
    });
  }

  // 下单
  createOrder(params) {
    return this.bin._qer({
      id: this.id,
      method: "POST",
      url: "/fapi/v1/order",
      params,
      isPrivate: true,
    });
  }

  // 调整杠杆
  changeLeverage(symbol, leverage) {
    return this.bin._qer({
      id: this.id,
      method: "POST",
      url: "/fapi/v1/leverage",
      params: { symbol, leverage },
      isPrivate: true,
    });
  }

  // 调整保证金模式 "true": 联合保证金模式开启；"false": 联合保证金模式关闭
  changeMarginType({ id, multiAssetsMargin }) {
    return this.bin._qer({
      id: this.id,
      method: "POST",
      url: "/fapi/v1/marginType",
      params: { multiAssetsMargin },
      isPrivate: true,
    });
  }

  // 更改持仓模式 "true": 双向持仓模式；"false": 单向持仓模式
  changePositionSide({ id, dualSidePosition }) {
    return this.bin._qer({
      id: this.id,
      method: "POST",
      url: "/fapi/v1/positionSide/dual",
      params: { dualSidePosition },
      isPrivate: true,
    });
  }

  // 获取持仓模式
  getPositionSide({ id }) {
    return this.bin._qer({
      id: this.id,
      method: "GET",
      url: "/fapi/v1/positionSide/dual",
      params: {},
      isPrivate: true,
    });
  }
}

module.exports = {
  Binance,
  BinanceMethod,
};
