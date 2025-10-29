import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).put(
  '/:id',
  async ({ params, body }: any) => {
    const { id } = params;
    const { role_name, description, status } = body;

    try {
      const updateData: any = {};
      if (role_name !== undefined) updateData.role_name = role_name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const result = await models.role.updateRole(id, updateData);

      if (!result) {
        return err(ResponseCode.INTERNAL_ERROR, '更新失败');
      }

      return success(null, '更新成功');
    } catch (error) {
      console.error('Update role error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '更新失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '角色 ID' }),
    }),
    body: t.Object({
      role_name: t.Optional(t.String({ description: '角色名称' })),
      description: t.Optional(t.String({ description: '角色描述' })),
      status: t.Optional(t.Number({ description: '状态：1-启用，0-禁用' })),
    }),
    detail: {
      tags: ['管理员-角色管理'],
      summary: '更新角色',
      description: '更新指定角色的信息',
      security: [{ BearerAuth: [] }],
    },
  }
);
