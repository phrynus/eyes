import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:userId/permissions/:permissionId',
  async ({ params }: any) => {
    const { userId, permissionId } = params;

    try {
      const result = await models.userPermission.deleteUserPermissionByUserAndPermission(userId, permissionId);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '移除失败');
      }

      return success(null, '移除成功');
    } catch (error) {
      console.error('Remove permission error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '移除失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
      permissionId: t.String({ description: '权限 ID' }),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '移除用户权限',
      description: '移除用户的指定直接权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
