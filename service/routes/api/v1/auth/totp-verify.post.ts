import { Elysia, t } from 'elysia';
import { authMiddleware } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';
import * as OTPAuth from 'otpauth';

export default new Elysia().use(authMiddleware()).post(
  '/totp/verify',
  async ({ body, user }: any) => {
    const { totpCode } = body;

    if (!totpCode) {
      return err(ResponseCode.BAD_REQUEST, 'TOTP 码不能为空');
    }

    try {
      const userInfo = await models.user.getUserById(user.id);
      if (!userInfo?.totp_secret) {
        return err(ResponseCode.BAD_REQUEST, '双因素认证未启用');
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(userInfo.totp_secret),
      });

      const delta = totp.validate({ token: totpCode, window: 1 });
      if (delta === null) {
        return err(ResponseCode.UNAUTHORIZED, 'TOTP 码无效');
      }

      return success(null, 'TOTP 验证成功');
    } catch (error) {
      console.error('TOTP verify error:', error);
      return err(ResponseCode.INTERNAL_ERROR, 'TOTP 验证失败');
    }
  },
  {
    body: t.Object({
      totpCode: t.String({ description: '6位数字 TOTP 码' }),
    }),
    detail: {
      tags: ['认证'],
      summary: '验证 TOTP 码',
      description: '验证当前用户的双因素认证码是否正确',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Null(),
        timestamp: t.Number(),
      }),
    },
  }
);
