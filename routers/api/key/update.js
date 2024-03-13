const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const randomId = require("../../../controllers/randomId");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const {
      keyId,
      name,
      safe_tradeList,
      safe_mustSymbol,
      safe_num,
      safe_full,
      safe_both,
      safe_trade,
    } = ctx.request.body;
    if (!id) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    key.name = name || key.name;
    key.safe_tradeList = safe_tradeList || key.safe_tradeList || {};
    key.safe_mustSymbol = safe_mustSymbol || key.safe_mustSymbol || {};
    key.safe_num = safe_num || key.safe_num || 10;
    key.safe_full = safe_full || key.safe_full || true;
    key.safe_both = safe_both || key.safe_both || true;
    key.safe_trade = safe_trade || key.safe_trade || true;
    await key.save();
    ctx.body = {
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
      safe_tradeList: key.safe_tradeList,
      safe_mustSymbol: key.safe_mustSymbol,
      safe_num: key.safe_num,
      safe_full: key.safe_full,
      safe_both: key.safe_both,
      safe_trade: key.safe_trade,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY更新] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 更新标记ID
router.post("/mark", async (ctx) => {
  try {
    const { keyId } = ctx.request.body;
    if (!keyId) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    key.markId = randomId(
      "mark",
      ctx.user.userId,
      key.exchange,
      key.key,
      key.secret,
      key.password,
      key.name,
      Date.now(),
    );
    key.seeId = randomId(
      "see",
      ctx.user.userId,
      key.exchange,
      key.key,
      key.secret,
      key.password,
      key.name,
      Date.now(),
    );
    await key.save();
    ctx.body = {
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY更新标记] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
// 删除策略
router.post("/ployDelete", async (ctx) => {
  try {
    const { keyId, ployId } = ctx.request.body;
    if (!keyId || !ployId) {
      ctx.status = 400;
      ctx.body = "ID不能为空";
      return;
    }
    const key = await db.Key.findById(keyId);
    if (!key) {
      ctx.status = 400;
      ctx.body = "ID不存在";
      return;
    }
    key.ployId = key.ployId.filter((id) => id !== ployId);
    await key.save();

    for (let j = 0; j < key.ployId.length; j++) {
      let ploy = await db.Ploy.findOne({ _id: key.ployId[j] });
      let user = await db.User.findOne({ _id: ploy.userId });
      key.ployId[j] = {
        ploy: ploy._id,
        ployName: ploy.name,
        ployUser: user.name,
      };
    }

    ctx.body = {
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
      ployId: key.ployId,
    };
  } catch (err) {
    logger.error(
      `[错误][KEY删除策略] ${err.message} > ${JSON.stringify(ctx.request.body)}`,
    );
    logger.error(err);
    ctx.status = 500;
    ctx.body = err.message;
  }
});
module.exports = router;
