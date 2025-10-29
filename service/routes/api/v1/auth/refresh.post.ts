import { Elysia, t } from 'elysia';
import { jwtAccessPlugin, jwtRefreshPlugin } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia()
  .use(jwtAccessPlugin)
  .use(jwtRefreshPlugin)
  .post(
    '/refresh',
    async ({ body, jwtAccess, jwtRefresh }: any) => {
      const { refreshToken } = body;

      if (!refreshToken) {
        return err(ResponseCode.BAD_REQUEST, 'Refresh token 不能为空');
      }

      try {
        // 验证 refresh token
        const payload = await jwtRefresh.verify(refreshToken);

        if (!payload) {
          return err(ResponseCode.UNAUTHORIZED, '无效的 refresh token');
        }

        // 获取用户信息
        const user = await models.user.getUserById((payload as any).userId);

        if (!user) {
          return err(ResponseCode.UNAUTHORIZED, '用户不存在');
        }

        if (user.status !== 1) {
          return err(ResponseCode.FORBIDDEN, '用户已被禁用');
        }

        // 生成新的 access token
        const newAccessToken = await jwtAccess.sign({ userId: user.uuid });

        return success(
          {
            accessToken: newAccessToken,
          },
          'Token 刷新成功'
        );
      } catch (error) {
        console.error('Refresh token error:', error);
        return err(ResponseCode.UNAUTHORIZED, 'Token 刷新失败');
      }
    },
    {
      body: t.Object({
        refreshToken: t.String({ description: 'Refresh Token' }),
      }),
      detail: {
        tags: ['认证'],
        summary: '刷新 Access Token',
        description: '使用 Refresh Token 获取新的 Access Token',
      },
      response: {
        200: t.Object({
          code: t.Number(),
          message: t.String(),
          data: t.Object({
            accessToken: t.String(),
          }),
          timestamp: t.Number(),
        }),
      },
    }
  );
