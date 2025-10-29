import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const result = await models.role.deleteRole(id);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '删除失败');
      }

      return success(null, '删除成功');
    } catch (error) {
      console.error('Delete role error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '删除失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '角色 ID' }),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '删除角色',
      description: '删除指定的角色',
      security: [{ BearerAuth: [] }],
    },
  }
);
