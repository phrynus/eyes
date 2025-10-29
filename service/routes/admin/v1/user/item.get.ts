import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { getUserAllPermissions } from '~/middlewares/permission.middleware';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const userInfo = await models.user.getUserById(id);

      if (!userInfo) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      // 获取用户的应用列表
      const applications = await models.userApplication.getUserApplicationsByUserId(id);

      // 获取用户的角色列表
      const roles = await models.userRole.getUserRolesByUserId(id);

      // 获取用户的所有权限
      const permissions = await getUserAllPermissions(id);

      return success({
        user: {
          id: userInfo.id,
          uuid: userInfo.uuid,
          username: userInfo.username,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          json_data: userInfo.json_data,
          status: userInfo.status,
          last_login_at: userInfo.last_login_at,
          created_at: userInfo.created_at,
        },
        applications,
        roles,
        permissions,
      });
    } catch (error) {
      console.error('Get user error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取用户信息失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '用户 ID 或 UUID' }),
    }),
    detail: {
      tags: ['管理员-用户管理'],
      summary: '获取指定用户信息',
      description: '获取指定用户的详细信息，包括应用、角色和权限',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Any(),
        timestamp: t.Number(),
      }),
    },
  }
);
