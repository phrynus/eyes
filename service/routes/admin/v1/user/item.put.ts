import { Elysia, t } from 'elysia';
import { adminAuthMiddleware } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { regexPatterns } from '~/config';
import models from '~/models';

export default new Elysia().use(adminAuthMiddleware()).put(
  '/:id',
  async ({ params, body }: any) => {
    const { id } = params;
    const { email, nickname, avatar_url, status } = body;

    try {
      // 验证邮箱格式
      if (email && !regexPatterns.emailRegex.test(email)) {
        return err(ResponseCode.BAD_REQUEST, '邮箱格式不正确');
      }

      // 验证昵称格式
      if (nickname && !regexPatterns.nicknameRegex.test(nickname)) {
        return err(ResponseCode.BAD_REQUEST, '昵称格式不正确：2-16位，允许中文、字母、数字下划线');
      }

      // 如果修改了邮箱，检查是否已被使用
      if (email) {
        const existingEmail = await models.user.getUserByEmail(email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return err(ResponseCode.BAD_REQUEST, '邮箱已被使用');
        }
      }

      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (status !== undefined) updateData.status = status;

      await models.user.updateUser(id, updateData);

      return success(null, '更新成功');
    } catch (error) {
      console.error('Update user error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '更新失败');
    }
  },
  {
    params: t.Object({
      id: t.String({ description: '用户 ID 或 UUID' }),
    }),
    body: t.Object({
      email: t.Optional(t.String({ format: 'email', description: '邮箱' })),
      nickname: t.Optional(t.String({ minLength: 2, maxLength: 16, description: '昵称' })),
      avatar_url: t.Optional(t.String({ description: '头像 URL' })),
      status: t.Optional(t.Number({ description: '状态：1-正常，0-禁用' })),
    }),
    detail: {
      tags: ['管理员-用户管理'],
      summary: '更新用户信息',
      description: '更新指定用户的信息',
      security: [{ BearerAuth: [] }],
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Null(),
        timestamp: t.Number(),
      }),
    },
  }
);
