const koaRouter = require('koa-router');
const logger = require('../../lib/logger');
const db = require('../../lib/db');

const config = require('../../config');

const randomId = require('../../controllers/randomId');

const router = new koaRouter();

router.post('/', async (ctx) => {
  try {
    const { keyId, symbol, type, positionSide, side, quantity } = ctx.request.body;

    // 判断参数
    if (!keyId || !symbol || !type || !positionSide || !side || !quantity) {
      ctx.status = 400;
      ctx.body = '参数错误';
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

    const bin = config.bin[key.markId];
    data = await bin.client.qer({
      id: '手动平单:' + keyId,
      method: 'POST',
      url: '/fapi/v1/order',
      params: {
        symbol,
        type,
        positionSide,
        side,
        quantity,
      },
      isPrivate: true,
    });

    ctx.body = data;
  } catch (err) {
    logger.error(`[错误][平仓] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
