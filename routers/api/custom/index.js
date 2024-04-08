const koaRouter = require('koa-router');
const logger = require('../../../lib/logger');
const db = require('../../../lib/db');
const config = require('../../../config');

const router = new koaRouter();

router.post('/', async (ctx) => {
  try {
    const { url, keyId, method, params = {} } = ctx.request.body;
    // URL白名单
    const urls = ['/fapi/v2/account', '/fapi/v1/exchangeInfo'];
    const isUrl = urls.filter((item) => item == url);

    // 判断参数
    if (!url || !method || isUrl.length < 1) {
      ctx.status = 400;
      ctx.body = '参数错误';
      return;
    }
    let data;
    if (keyId) {
      const key = await db.Key.findOne({ _id: keyId });
      if (!key) {
        ctx.status = 400;
        ctx.body = 'KEY不存在';
        return;
      }

      const bin = config.bin[key.markId];
      data = await bin.client.qer({
        id: '自定义请求:' + keyId,
        method,
        url,
        params,
        isPrivate: true,
      });
    } else {
      const bin = config.bin['37e3f72df03110905391ba0d5928bd57'];
      data = await bin.client.qer({
        id: '自定义请求:' + keyId,
        method,
        url,
        params,
        isPrivate: false,
      });
    }

    ctx.body = data;
  } catch (err) {
    logger.error(`[错误][自定义请求] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});

module.exports = router;
