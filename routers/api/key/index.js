const koaRouter = require('koa-router');
const logger = require('../../../lib/logger');
const db = require('../../../lib/db');

const client = require('../../../lib/client');

const validators = require('../../../controllers/validators');

const config = require('../../../config');

const randomId = require('../../../controllers/randomId');

const routerUpdate = require('./update');

const router = new koaRouter();

router.post('/add', async (ctx) => {
  try {
    const { exchange, key, secret, password = '', name } = ctx.request.body;

    // 判断参数
    if (!exchange || !key || !secret || !name) {
      ctx.status = 400;
      ctx.body = '参数错误';
      return;
    }

    // 判断是否存在
    const keyExist = await db.Key.findOne({ exchange, key });
    if (keyExist) {
      ctx.status = 400;
      ctx.body = 'KEY已存在';
      return;
    }
    // 判断名下有多少个KEY
    const keys = await db.Key.find({ userId: ctx.user.userId });
    if (keys.length > 5) {
      ctx.status = 400;
      ctx.body = 'KEY数量已达上限';
      return;
    }
    // 检查safe_tradeList格式

    // 添加
    const newKey = new db.Key({
      // 用户ID
      userId: ctx.user.userId,
      // 标记ID
      markId: randomId('mark', Date.now()),
      // 观摩ID
      seeId: randomId('see', Date.now()),
      exchange,
      key,
      secret,
      password,
      name,
      safe_tradeList: {
        BTCUSDT: {
          split: false,
          full: false,
          must: false,
          Lever: 20,
        },
      },
    });

    let c = null;
    if (exchange === 'binance') {
      c = new client.Binance({
        baseUrl: config.bin.binance.baseUrl,
        key: key,
        secret: secret,
        maxRetries: 5,
        retryDelay: 200,
        timeOffset: config.bin.binance.timeOffset,
      });
    }
    if (!c) {
      ctx.status = 400;
      ctx.body = 'KEY不可用';
      return;
    }
    // 验证是否可用
    const account = await c.getAccount().catch((err) => {
      return false;
    });
    if (!account) {
      ctx.status = 400;
      ctx.body = 'KEY验证失败';
      return;
    }

    config.bin[newKey.markId] = {
      ...newKey._doc,
      coins: [],
      client: c,
    };

    await newKey.save();

    const rkey = { ...newKey._doc };

    delete rkey.key;
    delete rkey.secret;
    delete rkey.password;

    ctx.body = rkey;
  } catch (err) {
    logger.error(`[错误][KEY添加] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 删除key
router.post('/delete', async (ctx) => {
  try {
    const { keyId } = ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = '参数错误';
      return;
    }
    const key = await db.Key.findOne({ _id: keyId });
    if (!key) {
      ctx.status = 400;
      ctx.body = 'KEY不存在';
      return;
    }
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = 'KEY与账户不符';
      return;
    }
    // 删除KEY
    for (const ployIdKey in key.ployId) {
      console.log(ployIdKey);
      let ploy = await db.Ploy.findOne({ _id: ployIdKey });
      if (!ploy) {
        continue;
      }
      delete ploy.keyId[keyId];
      await db.Ploy.updateOne(
        { _id: ploy._id },
        {
          $set: {
            keyId: ploy.keyId,
          },
        }
      );
    }
    await db.Key.deleteOne({ _id: keyId });
    delete config.bin[key.markId];
    ctx.body = 'ok';
  } catch (err) {
    logger.error(`[错误][KEY删除] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

router.use('/update', routerUpdate.routes(), routerUpdate.allowedMethods());

module.exports = router;
