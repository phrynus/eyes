import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const result = await models.user.deleteUser(id);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '删除失败');
      }

      return success(null, '删除成功');
    } catch (error) {
      console.error('Delete user error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '删除失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '用户 ID 或 UUID' }),
    }),
    detail: {
      tags: ['管理员-用户管理'],
      summary: '删除用户',
      description: '删除指定的用户',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Null(),
        timestamp: t.Number(),
      }),
    },
  }
);
