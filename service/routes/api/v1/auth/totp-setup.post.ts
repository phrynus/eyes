import { Elysia, t } from 'elysia';
import { authMiddleware } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';
import * as OTPAuth from 'otpauth';

export default new Elysia().use(authMiddleware()).post(
  '/totp/setup',
  async ({ user }: any) => {
    try {
      // 检查用户是否已经启用 TOTP
      const userInfo = await models.user.getUserById(user.id);

      if (userInfo?.totp_secret) {
        return err(ResponseCode.BAD_REQUEST, '双因素认证已启用');
      }

      // 生成 TOTP 密钥
      const totp = new OTPAuth.TOTP({
        issuer: 'EYES',
        label: user.username,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });

      const secret = totp.secret.base32;
      const uri = totp.toString();

      // 保存 TOTP 密钥
      await models.user.setTotpSecret(user.id, secret);

      return success(
        {
          secret,
          qrCodeUri: uri,
        },
        'TOTP 密钥生成成功，请使用认证器应用扫描二维码'
      );
    } catch (error) {
      console.error('TOTP setup error:', error);
      return err(ResponseCode.INTERNAL_ERROR, 'TOTP 设置失败');
    }
  },
  {
    detail: {
      tags: ['认证'],
      summary: '启用双因素认证',
      description: '为当前用户生成 TOTP 密钥，返回二维码 URI',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Object({
          secret: t.String({ description: 'TOTP 密钥' }),
          qrCodeUri: t.String({ description: '二维码 URI' }),
        }),
        timestamp: t.Number(),
      }),
    },
  }
);
