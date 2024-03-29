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

  async qer({ id = "", method, url, params, isPrivate = false }) {
    let retryCount = 0;
    const timeOn = new Date();
    logger.trace(
      `[${id}][Binance][请求][${url}] > `,
      method,
      JSON.stringify(params),
      isPrivate,
    );
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
          timeout: 5000, // 设置请求超时时间为5秒
        };
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
              `[${id}][Binance][响应][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params)} > ${
                JSON.stringify(error.response?.data) || ""
              }`,
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
              `[${id}][Binance][重发][${error.response.status}][${new Date() - timeOn}ms][${url}] > ${JSON.stringify(params) || ""} ${error.message} `,
            );
            await sleep(this.retryDelay);
            return makeRequest(); // 递归调用，重试请求
          }
        }
        logger.error(
          `[${id}][Binance][报错][${new Date() - timeOn}ms][${error.code}][${error.response?.data?.code || error.response?.status}][${url}] > ${JSON.stringify(params) || ""} ${error.message} ${JSON.stringify(error.response?.data)}`,
        );
        throw error;
      }
    };
    return makeRequest();
  }

  getServerTime(id) {
    return this.qer({
      id,
      method: "GET",
      url: "/fapi/v1/time",
      params: {},
    });
  }

  getAccount(id) {
    return this.qer({
      id,
      method: "GET",
      url: "/fapi/v2/account",
      params: {},
      isPrivate: true,
    });
  }

  getExchangeInfo(id = "ExchangeInfo") {
    return this.bin.qer({
      id,
      method: "GET",
      url: "/fapi/v1/exchangeInfo",
      params: {},
    });
  }

  changeLeverage(id, symbol, leverage) {
    return this.bin.qer({
      id,
      method: "POST",
      url: "/fapi/v1/leverage",
      params: { symbol, leverage },
      isPrivate: true,
    });
  }
}

module.exports = Binance;
