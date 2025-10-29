import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/:userId/roles/batch',
  async ({ params, body }: any) => {
    const { userId } = params;
    const { app_id, role_ids } = body;

    if (!app_id || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
      return err(ResponseCode.BAD_REQUEST, '应用ID和角色ID列表不能为空');
    }

    try {
      const user = await models.user.getUserById(userId);
      if (!user) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      const results = [];
      for (const roleId of role_ids) {
        try {
          const result = await models.userRole.create({
            user_id: userId,
            app_id,
            role_id: roleId,
            status: 1,
          });
          results.push(result);
        } catch (error: any) {
          if (!error.message || !error.message.includes('Duplicate')) {
            console.error('Error assigning role:', error);
          }
        }
      }

      return success(results, '角色批量分配成功');
    } catch (error) {
      console.error('Batch assign roles error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '角色批量分配失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
    }),
    body: t.Object({
      app_id: t.Number({ description: '应用 ID' }),
      role_ids: t.Array(t.Number(), { description: '角色 ID 列表' }),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '批量分配角色',
      description: '为用户批量分配多个角色',
      security: [{ BearerAuth: [] }],
    },
  }
);
