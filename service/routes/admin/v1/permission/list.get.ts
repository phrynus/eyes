import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/',
  async ({ query }: any) => {
    const { app_id } = query;

    try {
      let permissions;
      if (app_id) {
        permissions = await models.permission.getPermissionsByAppId(app_id);
      } else {
        permissions = await models.permission.getAllPermissions();
      }

      return success(permissions);
    } catch (error) {
      console.error('Get permissions error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取权限列表失败');
    }
  },
  {
    query: t.Object({
      app_id: t.Optional(t.String({ description: '应用 ID（筛选）' })),
    }),
    detail: {
      tags: ['管理员-权限管理'],
      summary: '获取权限列表',
      description: '获取所有权限或指定应用下的权限列表',
      security: [{ BearerAuth: [] }],
    },
  }
);
