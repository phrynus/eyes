import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).post(
  '/',
  async ({ body }: any) => {
    const { app_id, role_code, role_name, description } = body;

    if (!app_id || !role_code || !role_name) {
      return err(ResponseCode.BAD_REQUEST, '应用ID、角色编码和名称不能为空');
    }

    try {
      // 检查应用是否存在
      const application = await models.application.getApplicationById(app_id);
      if (!application) {
        return err(ResponseCode.BAD_REQUEST, '应用不存在');
      }

      const role = await models.role.create({
        app_id,
        role_code,
        role_name,
        description: description || '',
        status: 1,
      });

      return success(role, '创建成功');
    } catch (error: any) {
      console.error('Create role error:', error);
      if (error.message && error.message.includes('Duplicate')) {
        return err(ResponseCode.BAD_REQUEST, '该应用下角色编码已存在');
      }
      return err(ResponseCode.INTERNAL_ERROR, '创建失败');
    }
  },
  {
    body: t.Object({
      app_id: t.Number({ description: '应用 ID' }),
      role_code: t.String({ description: '角色编码' }),
      role_name: t.String({ description: '角色名称' }),
      description: t.Optional(t.String({ description: '角色描述' })),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '创建角色',
      description: '在指定应用下创建新角色',
      security: [{ BearerAuth: [] }],
    },
  }
);
