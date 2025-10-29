import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/:userId/roles',
  async ({ params, body }: any) => {
    const { userId } = params;
    const { app_id, role_id, expire_time } = body;

    if (!app_id || !role_id) {
      return err(ResponseCode.BAD_REQUEST, '应用ID和角色ID不能为空');
    }

    try {
      const user = await models.user.getUserById(userId);
      if (!user) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      const role = await models.role.getRoleById(role_id);
      if (!role) {
        return err(ResponseCode.NOT_FOUND, '角色不存在');
      }

      if (role.app_id !== parseInt(app_id)) {
        return err(ResponseCode.BAD_REQUEST, '角色不属于指定应用');
      }

      const userRole = await models.userRole.create({
        user_id: userId,
        app_id,
        role_id,
        status: 1,
        expire_time: expire_time || null,
      });

      return success(userRole, '角色分配成功');
    } catch (error: any) {
      console.error('Assign role error:', error);
      if (error.message && error.message.includes('Duplicate')) {
        return err(ResponseCode.BAD_REQUEST, '用户已拥有该角色');
      }
      return err(ResponseCode.INTERNAL_ERROR, '角色分配失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
    }),
    body: t.Object({
      app_id: t.Number({ description: '应用 ID' }),
      role_id: t.Number({ description: '角色 ID' }),
      expire_time: t.Optional(t.String({ description: '过期时间' })),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '为用户分配角色',
      description: '为指定用户分配角色',
      security: [{ BearerAuth: [] }],
    },
  }
);
