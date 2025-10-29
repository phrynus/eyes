import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const result = await models.permission.deletePermission(id);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '删除失败');
      }

      return success(null, '删除成功');
    } catch (error) {
      console.error('Delete permission error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '删除失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '权限 ID' }),
    }),
    detail: {
      tags: ['管理员-权限管理'],
      summary: '删除权限',
      description: '删除指定的权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
