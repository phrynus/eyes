import { Elysia, t } from 'elysia';
import { jwtAccessPlugin, jwtRefreshPlugin } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { passwordUtils } from '~/utils/password.utils';
import models from '~/models';
import * as OTPAuth from 'otpauth';

export default new Elysia()
  .use(jwtAccessPlugin)
  .use(jwtRefreshPlugin)
  .post(
    '/login',
    async ({ body, jwtAccess, jwtRefresh }: any) => {
      const { username, password, totpCode } = body;

      // 验证必填字段
      if (!username || !password) {
        return err(ResponseCode.BAD_REQUEST, '用户名和密码不能为空');
      }

      try {
        // 查找用户
        const user = await models.user.getUserByUsernameOrEmail(username);
        console.log(user, !user);

        if (!user) {
          return err(ResponseCode.UNAUTHORIZED, '用户名或密码错误');
        }

        // 检查用户状态
        if (user.status !== 1) {
          return err(ResponseCode.FORBIDDEN, '用户已被禁用');
        }

        // 验证密码
        const passwordValid = await passwordUtils.verify(password, user.password_hash);
        if (!passwordValid) {
          return err(ResponseCode.UNAUTHORIZED, '用户名或密码错误');
        }

        // 如果用户启用了 TOTP，验证 TOTP 码
        if (user.totp_secret) {
          if (!totpCode) {
            return err(ResponseCode.BAD_REQUEST, '请提供双因素认证码');
          }

          const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(user.totp_secret),
          });

          const delta = totp.validate({ token: totpCode, window: 1 });
          if (delta === null) {
            return err(ResponseCode.UNAUTHORIZED, '双因素认证码无效');
          }
        }

        // 更新最后登录时间
        await models.user.updateLastLogin(user.id);

        // 生成 tokens
        const accessToken = await jwtAccess.sign({ userId: user.uuid });
        const refreshToken = await jwtRefresh.sign({ userId: user.uuid });

        return success(
          {
            user: {
              uuid: user.uuid,
              username: user.username,
              email: user.email,
              nickname: user.nickname,
              avatar_url: user.avatar_url,
              hasTOTP: !!user.totp_secret,
            },
            tokens: {
              accessToken,
              refreshToken,
            },
          },
          '登录成功'
        );
      } catch (error: any) {
        console.error('Login error:', error);
        return err(ResponseCode.INTERNAL_ERROR, '登录失败');
      }
    },
    {
      body: t.Object({
        username: t.String({ description: '用户名/邮箱' }),
        password: t.String({ description: '密码' }),
        totpCode: t.Optional(t.String({ description: '双因素认证码（如已启用）' })),
      }),
      detail: {
        tags: ['认证'],
        summary: '用户登录',
        description: '使用用户名和密码登录，如启用双因素认证需提供 TOTP 码',
      },
      response: {
        200: t.Object({
          code: t.Number(),
          message: t.String(),
          data: t.Object({
            user: t.Object({
              uuid: t.String(),
              username: t.String(),
              email: t.Union([t.String(), t.Null()]),
              nickname: t.Union([t.String(), t.Null()]),
              avatar_url: t.Union([t.String(), t.Null()]),
              hasTOTP: t.Boolean(),
            }),
            tokens: t.Object({
              accessToken: t.String(),
              refreshToken: t.String(),
            }),
          }),
          timestamp: t.Number(),
        }),
      },
    }
  );
