import { Elysia, t } from 'elysia';
import { authMiddleware } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { regexPatterns } from '~/config';
import { passwordUtils } from '~/utils/password.utils';
import models from '~/models';

export default new Elysia().use(authMiddleware()).put(
  '/password',
  async ({ body, user }: any) => {
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return err(ResponseCode.BAD_REQUEST, '旧密码和新密码不能为空');
    }

    // 验证新密码格式
    if (!regexPatterns.passwordRegex.test(newPassword)) {
      return err(ResponseCode.BAD_REQUEST, '新密码格式不正确：6-24位，允许大小写字母、数字和基本特殊字符');
    }

    try {
      // 获取用户信息
      const userInfo = await models.user.getUserById(user.id);
      if (!userInfo) {
        return err(ResponseCode.NOT_FOUND, '用户不存在');
      }

      // 验证旧密码
      const passwordValid = await passwordUtils.verify(oldPassword, userInfo.password_hash);
      if (!passwordValid) {
        return err(ResponseCode.UNAUTHORIZED, '旧密码错误');
      }

      // 更新密码
      await models.user.updatePassword(user.id, newPassword);

      return success(null, '密码修改成功');
    } catch (error) {
      console.error('Update password error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '密码修改失败');
    }
  },
  {
    body: t.Object({
      oldPassword: t.String({ description: '旧密码' }),
      newPassword: t.String({ minLength: 6, maxLength: 24, description: '新密码' }),
    }),
    detail: {
      tags: ['用户'],
      summary: '修改密码',
      description: '修改当前用户的登录密码',
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
