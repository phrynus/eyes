const koaRouter = require('koa-router');
const logger = require('../../../lib/logger');
const db = require('../../../lib/db');
const config = require('../../../config');

const router = new koaRouter();

router.post('/', async (ctx) => {
    try {
        const { url, keyId, method, params = {} } = ctx.request.body;

        console.log(url, keyId);

        // 判断参数
        if (!url || !keyId || !method) {
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

        const bin = config.bin[key.markId];
        const data = await bin.client.qer({
            id: '自定义请求:' + keyId,
            method,
            url,
            params,
            isPrivate: true,
        });

        ctx.body = data;
    } catch (err) {
        logger.error(`[错误][自定义请求] ${err.message} > ${JSON.stringify(ctx.request.body)}`);
        logger.error(err);
        ctx.status = 500;
        ctx.body = err.message;
    }
});

module.exports = router;
