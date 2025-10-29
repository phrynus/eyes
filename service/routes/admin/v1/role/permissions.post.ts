import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/:id/permissions',
  async ({ params, body }: any) => {
    const { id } = params;
    const { permission_ids } = body;

    if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
      return err(ResponseCode.BAD_REQUEST, '权限ID列表不能为空');
    }

    try {
      // 检查角色是否存在
      const role = await models.role.getRoleById(id);
      if (!role) {
        return err(ResponseCode.NOT_FOUND, '角色不存在');
      }

      // 批量创建角色权限关联
      const results = [];
      for (const permissionId of permission_ids) {
        try {
          const result = await models.rolePermission.create({
            role_id: id,
            permission_id: permissionId,
          });
          results.push(result);
        } catch (error: any) {
          // 忽略重复的关联
          if (!error.message || !error.message.includes('Duplicate')) {
            throw error;
          }
        }
      }

      return success(results, '权限分配成功');
    } catch (error) {
      console.error('Assign permissions error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '权限分配失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '角色 ID' }),
    }),
    body: t.Object({
      permission_ids: t.Array(t.Number(), { description: '权限 ID 列表' }),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '为角色分配权限',
      description: '为指定角色批量分配权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
