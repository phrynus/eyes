import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).delete(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const result = await models.application.deleteApplication(id);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '删除失败');
      }

      return success(null, '删除成功');
    } catch (error) {
      console.error('Delete application error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '删除失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '应用 ID 或编码' }),
    }),
    detail: {
      tags: ['管理员-应用管理'],
      summary: '删除应用',
      description: '删除指定的应用',
      security: [{ BearerAuth: [] }],
    },
  }
);
