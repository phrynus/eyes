import { Elysia, t } from 'elysia';
import { authMiddleware } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { getUserAllPermissions } from '~/middlewares/permission.middleware';
import models from '~/models';

export default new Elysia().use(authMiddleware()).get(
  '/profile',
  async ({ user }: any) => {
    try {
      const userInfo = await models.user.getUserById(user.id);

      if (!userInfo) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      if (userInfo.status !== 1) {
        return err(ResponseCode.FORBIDDEN, '用户已被禁用');
      }

      // 获取用户的应用列表
      const applications = await models.userApplication.getUserApplicationsByUserId(user.id);

      // 获取用户的角色列表
      const roles = await models.userRole.getUserRolesByUserId(user.id);

      // 获取用户的所有权限
      const permissions = await getUserAllPermissions(user.id);

      return success({
        user: {
          uuid: userInfo.uuid,
          username: userInfo.username,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          json_data: userInfo.json_data,
        },
        applications,
        roles,
        permissions,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取用户信息失败');
    }
  },
  {
    detail: {
      tags: ['用户'],
      summary: '获取当前用户信息',
      description: '获取当前登录用户的详细信息，包括应用、角色和权限',
      security: [{ BearerAuth: [] }],
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
            nickname: t.String(),
            avatar_url: t.Union([t.String(), t.Null()]),
            json_data: t.Any(),
          }),
          applications: t.Array(t.Any()),
          roles: t.Array(t.Any()),
          permissions: t.Array(t.String()),
        }),
        timestamp: t.Number(),
      }),
    },
  }
);
