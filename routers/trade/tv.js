const koaRouter = require("koa-router");
const logger = require("../../lib/logger");
const db = require("../../lib/db");
const config = require("../../config");
const client = require("../../lib/client");
const escapeHtml = require("escape-html");

const analysis = require("../../lib/analysis");

const router = new koaRouter();

router.post("/ploy", async (ctx) => {
  try {
    // 取参数
    const params = ({
      markId,
      ticker,
      market_position,
      prev_market_position,
      action,
      position_size,
      market_position_size,
      prev_market_position_size,
      contracts,
      price,
      type,
      comment,
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
      symbol: params.ticker,
      comment: escapeHtml(params.comment),
      params,
    });
    logger.info(
      `[TRADE][TV][PLOY][${newPloyLog._id}][接收]`,
      JSON.stringify(newPloyLog),
    );

    const keyNames = [];
    for (let i = 0; i < ploy.keyId.length; i++) {
      let key = await db.Key.findOne({ _id: ploy.keyId[i] });
      if (!key) {
        ctx.status = 400;
        ctx.body = "markId not found";
        return;
      }
      let user = await db.User.findOne({ _id: key.userId });
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
          coins: [],
        };
      }
      let newKeyLog = new db.KeyLog({
        userName: user.name,
        keyName: key.name,
        symbol: params.ticker,
        comment: escapeHtml(params.comment),
        params,
      });
      await newKeyLog.save();
      logger.info(
        `[${newKeyLog._id}][TRADE][TV][PLOY][TV][接收]`,
        JSON.stringify(newKeyLog),
      );
      analysis.Tv({
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
      `[错误][TRADE][PLOY] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
const order = require("../../lib/order");
router.post("/", async (ctx) => {
  try {
    // 取参数
    const params = ({
      markId,
      ticker,
      market_position,
      prev_market_position,
      action,
      position_size,
      market_position_size,
      prev_market_position_size,
      contracts,
      price,
      type,
      comment,
    } = ctx.request.body);
    // if (config.bin[params.markId]) {
    //   order.Binance({
    //     bin: config.bin[params.markId],
    //     params,
    //   });
    // }
    // ctx.body = "ok";
    // return;

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
        coins: [],
      };
    }
    const newKeyLog = new db.KeyLog({
      userName: user.name,
      keyName: key.name,
      symbol: params.ticker,
      comment: escapeHtml(params.comment),
      params,
    });

    await newKeyLog.save();
    logger.info(
      `[TRADE][TV][TV][${newKeyLog._id}][接收]`,
      JSON.stringify(newKeyLog),
    );
    analysis.Tv({
      newKeyLog,
      bin,
      user,
      key,
      params,
    });
    ctx.body = "ok";
  } catch (err) {
    logger.error(
      `[错误][TRADE][TV] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
