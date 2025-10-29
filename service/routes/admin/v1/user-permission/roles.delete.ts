import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:userId/roles/:roleId',
  async ({ params }: any) => {
    const { userId, roleId } = params;

    try {
      const result = await models.userRole.deleteUserRoleByUserAndRole(userId, roleId);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '移除失败');
      }

      return success(null, '移除成功');
    } catch (error) {
      console.error('Remove role error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '移除失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
      roleId: t.String({ description: '角色 ID' }),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '移除用户角色',
      description: '移除用户的指定角色',
      security: [{ BearerAuth: [] }],
    },
  }
);
