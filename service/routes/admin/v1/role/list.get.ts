import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/',
  async ({ query }: any) => {
    const { app_id } = query;

    try {
      let roles;
      if (app_id) {
        roles = await models.role.getRolesByAppId(app_id);
      } else {
        roles = await models.role.getAllRoles();
      }

      return success(roles);
    } catch (error) {
      console.error('Get roles error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取角色列表失败');
    }
  },
  {
    query: t.Object({
      app_id: t.Optional(t.String({ description: '应用 ID（筛选）' })),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '获取角色列表',
      description: '获取所有角色或指定应用下的角色列表',
      security: [{ BearerAuth: [] }],
    },
  }
);
