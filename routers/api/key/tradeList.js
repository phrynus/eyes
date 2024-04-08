const koaRouter = require('koa-router');
const logger = require('../../../lib/logger');
const db = require('../../../lib/db');
const initID = require('../../../controllers/initID');
const randomId = require('../../../controllers/randomId');

const router = new koaRouter();

router.post('/', async (ctx) => {
  try {
    const { keyId, tradeList } = ctx.request.body;
    if ((!keyId, !tradeList)) {
      ctx.status = 400;
      ctx.body = 'ID不能为空';
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = 'ID不存在';
      return;
    }
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = 'KEY与账户不符';
      return;
    }

    for (let key in tradeList) {
      // 用正则判断格式
      if (
        !/^[\d]{1,3}$/.test(tradeList[key].lever) ||
        !/^(true|false)$/.test(tradeList[key].split) ||
        !/^(true|false)$/.test(tradeList[key].must) ||
        !/^(LIMIT|MARKET|TICKER)$/.test(tradeList[key].type)
      ) {
        ctx.status = 400;
        ctx.body = '格式错误';
        return;
      }
      tradeList[key].timeInForce = 'GTC';
    }

    key.safe_tradeList = { ...key.safe_tradeList, ...tradeList };

    await key.save();
    await initID(key._id);

    const keys = await db.Key.find(
      { userId: key.userId },
      {
        userId: 0,
        key: 0,
        secret: 0,
        password: 0,
        __v: 0,
      }
    ).exec();

    ctx.body = keys;
  } catch (err) {
    logger.error(`[错误][KEY更新] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
router.post('/delete', async (ctx) => {
  try {
    const { keyId, tradeListName = [], all = false } = ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = '参数错误';
      return;
    } else if (tradeListName.length < 1) {
      if (all == false) {
        ctx.status = 400;
        ctx.body = '参数错误';
        return;
      }
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = 'ID不存在';
      return;
    }
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = 'KEY与账户不符';
      return;
    }

    let t = key.safe_tradeList;
    if (all) {
      t = {};
    } else {
      tradeListName.map((time) => {
        delete t[time];
      });
    }

    key.safe_tradeList = { ...t };
    await db.Key.updateOne(
      { _id: key._id },
      {
        $set: {
          safe_tradeList: { ...t },
        },
      }
    );
    await initID(key._id);

    const keys = await db.Key.find(
      { userId: key.userId },
      {
        userId: 0,
        key: 0,
        secret: 0,
        password: 0,
        __v: 0,
      }
    ).exec();

    ctx.body = keys;
  } catch (err) {
    logger.error(`[错误][KEY更新] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
