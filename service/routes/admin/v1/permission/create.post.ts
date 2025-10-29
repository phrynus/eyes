import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/',
  async ({ body }: any) => {
    const { app_id, permission_code, permission_name, description } = body;

    if (!app_id || !permission_code || !permission_name) {
      return err(ResponseCode.BAD_REQUEST, '应用ID、权限编码和名称不能为空');
    }

    try {
      const application = await models.application.getApplicationById(app_id);
      if (!application) {
        return err(ResponseCode.BAD_REQUEST, '应用不存在');
      }

      const permission = await models.permission.create({
        app_id,
        permission_code,
        permission_name,
        description: description || '',
        status: 1,
      });

      return success(permission, '创建成功');
    } catch (error: any) {
      console.error('Create permission error:', error);
      if (error.message && error.message.includes('Duplicate')) {
        return err(ResponseCode.BAD_REQUEST, '该应用下权限编码已存在');
      }
      return err(ResponseCode.INTERNAL_ERROR, '创建失败');
    }
  },
  {
    body: t.Object({
      app_id: t.Number({ description: '应用 ID' }),
      permission_code: t.String({ description: '权限编码' }),
      permission_name: t.String({ description: '权限名称' }),
      description: t.Optional(t.String({ description: '权限描述' })),
    }),
    detail: {
      tags: ['管理员-权限管理'],
      summary: '创建权限',
      description: '在指定应用下创建新权限',
      security: [{ BearerAuth: [] }],
    },
  }
);
