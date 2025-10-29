import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/:userId/permissions',
  async ({ params, body }: any) => {
    const { userId } = params;
    const { app_id, permission_id, expire_time } = body;

    if (!app_id || !permission_id) {
      return err(ResponseCode.BAD_REQUEST, '应用ID和权限ID不能为空');
    }

    try {
      const user = await models.user.getUserById(userId);
      if (!user) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      const permission = await models.permission.getPermissionById(permission_id);
      if (!permission) {
        return err(ResponseCode.NOT_FOUND, '权限不存在');
      }

      if (permission.app_id !== parseInt(app_id)) {
        return err(ResponseCode.BAD_REQUEST, '权限不属于指定应用');
      }

      const userPermission = await models.userPermission.create({
        user_id: userId,
        app_id,
        permission_id,
        status: 1,
        expire_time: expire_time || null,
      });

      return success(userPermission, '权限分配成功');
    } catch (error: any) {
      console.error('Assign permission error:', error);
      if (error.message && error.message.includes('Duplicate')) {
        return err(ResponseCode.BAD_REQUEST, '用户已拥有该权限');
      }
      return err(ResponseCode.INTERNAL_ERROR, '权限分配失败');
    }
  },
  {
    params: t.Object({
      userId: t.String({ description: '用户 ID' }),
    }),
    body: t.Object({
      app_id: t.Number({ description: '应用 ID' }),
      permission_id: t.Number({ description: '权限 ID' }),
      expire_time: t.Optional(t.String({ description: '过期时间' })),
    }),
    detail: {
      tags: ['管理员-用户权限管理'],
      summary: '为用户分配权限',
      description: '为指定用户直接分配权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
