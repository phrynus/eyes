import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/list',
  async () => {
    try {
      const users = await models.user.getAllUsers();
      return success(users);
    } catch (error) {
      console.error('Get users error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取用户列表失败');
    }
  },
  {
    detail: {
      tags: ['管理员-用户管理'],
      summary: '获取用户列表',
      description: '获取系统中所有用户的列表',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Array(t.Any()),
        timestamp: t.Number(),
      }),
    },
  }
);
