import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { getUserAllPermissions } from '~/middlewares/permission.middleware';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/:userId/permissions',
  async ({ params, query }: any) => {
    const { userId } = params;
    const { app_id } = query;

    try {
      const user = await models.user.getUserById(userId);
      if (!user) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      const permissions = await getUserAllPermissions(userId, app_id);

      const roles = app_id ? await models.userRole.getUserRolesByUserIdAndAppId(userId, app_id) : await models.userRole.getUserRolesByUserId(userId);

      const directPermissions = app_id ? await models.userPermission.getUserPermissionsByUserIdAndAppId(userId, app_id) : await models.userPermission.getUserPermissionsByUserId(userId);

      return success({
        permissions,
        roles,
        directPermissions,
      });
    } catch (error) {
      console.error('Get user permissions error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取用户权限失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
    }),
    query: t.Object({
      app_id: t.Optional(t.String({ description: '应用 ID（筛选）' })),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '获取用户所有权限',
      description: '获取用户的所有权限（包括角色权限和直接权限）',
      security: [{ BearerAuth: [] }],
    },
  }
);
