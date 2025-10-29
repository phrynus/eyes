import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/:id',
  async ({ params }: any) => {
    const { id } = params;

    try {
      const role = await models.role.getRoleById(id);

      if (!role) {
        return err(ResponseCode.NOT_FOUND, '角色不存在');
      }

      // 获取角色的权限列表
      const permissions = await models.rolePermission.getRolePermissionsByRoleId(id);

      return success({
        ...role,
        permissions,
      });
    } catch (error) {
      console.error('Get role error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取角色详情失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '角色 ID' }),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '获取角色详情',
      description: '获取指定角色的详细信息，包括权限列表',
      security: [{ BearerAuth: [] }],
    },
  }
);
