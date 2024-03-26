const koaRouter = require("koa-router");
const logger = require("../../../lib/logger");
const db = require("../../../lib/db");
const initID = require("../../../controllers/initID");
const randomId = require("../../../controllers/randomId");

const router = new koaRouter();

router.post("/", async (ctx) => {
  try {
    const { keyId, name, safe_tradeList, safe_num, safe_both, safe_trade } =
      ctx.request.body;
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
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "KEY与账户不符";
      return;
    }

    if (safe_tradeList) {
      for (let key in safe_tradeList) {
        // 用正则判断格式
        if (
          !/^[\d]{1,3}$/.test(safe_tradeList[key].lever) ||
          !/^(true|false)$/.test(safe_tradeList[key].split) ||
          !/^(true|false)$/.test(safe_tradeList[key].must) ||
          !/^(LIMIT|MARKET)$/.test(safe_tradeList[key].type)
        ) {
          ctx.status = 400;
          ctx.body = "格式错误";
          return;
        }
      }
    }

    key.name = name || key.name;
    key.safe_tradeList = safe_tradeList || key.safe_tradeList;
    key.safe_num = safe_num || key.safe_num;
    key.safe_both = safe_both || key.safe_both;
    key.safe_trade = safe_trade || key.safe_trade;
    await key.save();
    await initID(key._id);
    ctx.body = {
      _id: key._id,
      name: key.name,
      exchange: key.exchange,
      markId: key.markId,
      seeId: key.seeId,
      safe_tradeList: key.safe_tradeList,
      safe_num: key.safe_num,
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
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "KEY与账户不符";
      return;
    }
    key.markId = randomId("mark", Date.now());
    key.seeId = randomId("see", Date.now());
    await key.save();
    await initID(key._id);
    ctx.body = {
      _id: key._id,
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
    if (key.userId !== ctx.user.userId) {
      ctx.status = 400;
      ctx.body = "KEY与账户不符";
      return;
    }
    const ploy = await db.Ploy.findById(ployId);
    if (!ploy) {
      ctx.status = 400;
      ctx.body = "策略不存在";
      return;
    }
    // 删除KEY
    delete ploy.keyId[keyId];
    await ploy.save();
    await db.Ploy.updateOne(
      { _id: ploy._id },
      {
        $set: {
          keyId: ploy.keyId,
        },
      },
    );
    // 删除策略
    delete key.ployId[ployId];
    await db.Key.updateOne(
      { _id: key._id },
      {
        $set: {
          ployId: key.ployId,
        },
      },
    );
    ctx.body = {
      _id: key._id,
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
