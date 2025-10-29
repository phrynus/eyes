import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).put(
  '/:id',
  async ({ params, body }: any) => {
    const { id } = params;
    const { permission_name, description, status } = body;

    try {
      const updateData: any = {};
      if (permission_name !== undefined) updateData.permission_name = permission_name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const result = await models.permission.updatePermission(id, updateData);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '更新失败');
      }

      return success(null, '更新成功');
    } catch (error) {
      console.error('Update permission error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '更新失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '权限 ID' }),
    }),
    body: t.Object({
      permission_name: t.Optional(t.String({ description: '权限名称' })),
      description: t.Optional(t.String({ description: '权限描述' })),
      status: t.Optional(t.Number({ description: '状态：1-启用，0-禁用' })),
    }),
    detail: {
      tags: ['管理员-权限管理'],
      summary: '更新权限',
      description: '更新指定权限的信息',
      security: [{ BearerAuth: [] }],
    },
  }
);
