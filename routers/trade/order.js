const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");
const client = require("../../lib/client");
const config = require("../../config");
const escapeHtml = require("escape-html");
const analysis = require("../../lib/analysis");

const router = new koaRouter();
router.post("/ploy", async (ctx) => {
  try {
    const params = ({
      markId,
      symbol,
      position,
      side,
      quantity,
      price,
      comment = "",
    } = ctx.request.body);
    const ploy = await db.Ploy.findOne({ markId });
    if (!ploy) {
      ctx.status = 400;
      ctx.body = "markId not found";
      return;
    }
    const ployUser = await db.User.findOne({ _id: ploy.userId });
    if (!ployUser) {
      ctx.status = 400;
      ctx.body = "userId not found";
      return;
    }
    const newPloyLog = new db.PloyLog({
      userName: ployUser.name,
      ployName: ploy.name,
      symbol: params.symbol,
      comment: escapeHtml(params.comment),
      params,
    });
    logger.info(
      `[${newPloyLog._id}][TRADE][TV][PLOY][接收]`,
      JSON.stringify(newPloyLog),
    );
    const keyNames = [];
    const keyIds = Object.keys(ploy.keyId);
    for (let i = 0; i < keyIds.length; i++) {
      let key = await db.Key.findOne({ _id: keyIds[i] });
      if (!key) {
        logger.error(`[错误][TRADE][TV][PLOY] key not found ${ploy.keyId[i]}`);
        continue;
      }
      if (key.ployId[params.markId]) {
        params.contracts = key.ployId[params.markId].lever * params.contracts;
      }
      let user = await db.User.findOne({ _id: key.userId });
      if (!user) {
        logger.error(
          `[错误][TRADE][TV][PLOY] "userId not found" ${ploy.keyId[i]}`,
        );
        continue;
      }
      let bin = null;
      if (key.exchange === "binance") {
        bin = {
          ...key._doc,
          client: new client.Binance({
            baseUrl: config.bin.binance.baseUrl,
            key: key.key,
            secret: key.secret,
            maxRetries: 5,
            retryDelay: 200,
            timeOffset: config.bin.binance.timeOffset,
          }),
        };
      }
      let newKeyLog = new db.KeyLog({
        userName: user.name,
        keyName: key.name,
        symbol: params.symbol,
        comment: escapeHtml(params.comment),
        params,
      });
      await newKeyLog.save();
      logger.info(
        `[${newKeyLog._id}][TRADE][ORDER][PLOY][TV][接收]`,
        JSON.stringify(newKeyLog),
      );
      analysis.Order({
        newKeyLog,
        bin,
        user,
        key,
        params,
      });
      keyNames.push({
        name: user.name,
        key: key.name,
      });
    }
    newPloyLog.keyNames = keyNames;
    await newPloyLog.save();
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][TRADE][ORDER] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
router.post("/", async (ctx) => {
  try {
    const params = ({
      markId,
      symbol,
      position,
      side,
      quantity,
      price,
      comment = "",
    } = ctx.request.body);
    const key = await db.Key.findOne({ markId });
    if (!key) {
      ctx.status = 400;
      ctx.body = "markId not found";
      return;
    }
    const user = await db.User.findOne({ _id: key.userId });
    if (!user) {
      ctx.status = 400;
      ctx.body = "userId not found";
      return;
    }
    let bin = null;
    if (key.exchange === "binance") {
      bin = {
        ...key._doc,
        client: new client.Binance({
          baseUrl: config.bin.binance.baseUrl,
          key: key.key,
          secret: key.secret,
          maxRetries: 5,
          retryDelay: 200,
          timeOffset: config.bin.binance.timeOffset,
        }),
      };
    }
    const newKeyLog = new db.KeyLog({
      userName: user.name,
      keyName: key.name,
      symbol: params.symbol,
      comment: escapeHtml(params.comment),
      params,
    });
    await newKeyLog.save();
    logger.info(
      `[${newKeyLog._id}][TRADE][ORDER][接收]`,
      JSON.stringify(newKeyLog),
    );
    analysis.Order({
      newKeyLog,
      bin,
      user,
      key,
      params,
    });
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][TRADE][ORDER] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
