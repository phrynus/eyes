import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).put(
  '/:id',
  async ({ params, body }: any) => {
    const { id } = params;
    const { app_name, description, icon_url, status } = body;

    try {
      const updateData: any = {};
      if (app_name !== undefined) updateData.app_name = app_name;
      if (description !== undefined) updateData.description = description;
      if (icon_url !== undefined) updateData.icon_url = icon_url;
      if (status !== undefined) updateData.status = status;

      const result = await models.application.updateApplication(id, updateData);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '更新失败');
      }

      return success(null, '更新成功');
    } catch (error) {
      console.error('Update application error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '更新失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '应用 ID 或编码' }),
    }),
    body: t.Object({
      app_name: t.Optional(t.String({ description: '应用名称' })),
      description: t.Optional(t.String({ description: '应用描述' })),
      icon_url: t.Optional(t.String({ description: '应用图标 URL' })),
      status: t.Optional(t.Number({ description: '状态：1-启用，0-禁用' })),
    }),
    detail: {
      tags: ['管理员-应用管理'],
      summary: '更新应用',
      description: '更新指定应用的信息',
      security: [{ BearerAuth: [] }],
    },
  }
);
