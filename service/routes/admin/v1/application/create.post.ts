import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/',
  async ({ body }: any) => {
    const { app_code, app_name, description, icon_url } = body;

    if (!app_code || !app_name) {
      return err(ResponseCode.BAD_REQUEST, '应用编码和名称不能为空');
    }

    try {
      // 检查应用编码是否已存在
      const existing = await models.application.getApplicationById(app_code);
      if (existing) {
        return err(ResponseCode.BAD_REQUEST, '应用编码已存在');
      }

      const application = await models.application.create({
        app_code,
        app_name,
        description: description || '',
        icon_url: icon_url || `https://api.dicebear.com/6.x/initials/svg?seed=${app_code}`,
        status: 1,
      });

      return success(application, '创建成功');
    } catch (error) {
      console.error('Create application error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '创建失败');
    }
  },
  {
    body: t.Object({
      app_code: t.String({ description: '应用编码' }),
      app_name: t.String({ description: '应用名称' }),
      description: t.Optional(t.String({ description: '应用描述' })),
      icon_url: t.Optional(t.String({ description: '应用图标 URL' })),
    }),
    detail: {
      tags: ['管理员-应用管理'],
      summary: '创建应用',
      description: '创建新的应用',
      security: [{ BearerAuth: [] }],
    },
  }
);
