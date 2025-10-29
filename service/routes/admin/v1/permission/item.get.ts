import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const permission = await models.permission.getPermissionById(id);

      if (!permission) {
        return err(ResponseCode.NOT_FOUND, '权限不存在');
      }

      return success(permission);
    } catch (error) {
      console.error('Get permission error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取权限详情失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '权限 ID' }),
    }),
    detail: {
      tags: ['管理员-权限管理'],
      summary: '获取权限详情',
      description: '获取指定权限的详细信息',
      security: [{ BearerAuth: [] }],
    },
  }
);
