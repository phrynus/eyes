import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const application = await models.application.getApplicationById(id);

      if (!application) {
        return err(ResponseCode.NOT_FOUND, '应用不存在');
      }

      // 获取应用下的角色数量
      const roles = await models.role.getRolesByAppId(id);

      // 获取应用下的权限数量
      const permissions = await models.permission.getPermissionsByAppId(id);

      return success({
        ...application,
        roleCount: roles.length,
        permissionCount: permissions.length,
      });
    } catch (error) {
      console.error('Get application error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取应用详情失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '应用 ID 或编码' }),
    }),
    detail: {
      tags: ['管理员-应用管理'],
      summary: '获取应用详情',
      description: '获取指定应用的详细信息',
      security: [{ BearerAuth: [] }],
    },
  }
);
