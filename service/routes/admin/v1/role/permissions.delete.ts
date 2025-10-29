import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:id/permissions/:permissionId',
  async ({ params }: any) => {
    const { id, permissionId } = params;

    try {
      const result = await models.rolePermission.deleteRolePermissionByRoleAndPermission(id, permissionId);

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
      id: t.String({ description: '角色 ID' }),
      permissionId: t.String({ description: '权限 ID' }),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '移除角色权限',
      description: '移除指定角色的某个权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
