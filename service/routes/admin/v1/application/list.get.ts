import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).get(
  '/',
  async () => {
    try {
      const applications = await models.application.getAllApplications();
      return success(applications);
    } catch (error) {
      console.error('Get applications error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '获取应用列表失败');
    }
  },
  {
    detail: {
      tags: ['管理员-应用管理'],
      summary: '获取应用列表',
      description: '获取所有应用的列表',
      security: [{ BearerAuth: [] }],
    },
  }
);
