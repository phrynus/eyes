import { Elysia, t } from 'elysia';
import { jwtAdminPlugin, verifyAdminCredentials } from '~/middlewares/admin-auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';

export default new Elysia().use(jwtAdminPlugin).post(
  '/login',
  async ({ body, jwtAdmin }: any) => {
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return err(ResponseCode.BAD_REQUEST, '用户名和密码不能为空');
    }

    try {
      // 验证管理员凭据（从 .env 读取）
      const isValid = verifyAdminCredentials(username, password);

      if (!isValid) {
        return err(ResponseCode.UNAUTHORIZED, '用户名或密码错误');
      }

      // 生成管理员 token
      const accessToken = await jwtAdmin.sign({
        adminId: username,
        isAdmin: true,
      });

      return success(
        {
          admin: {
            username,
            isAdmin: true,
          },
          token: accessToken,
        },
        '管理员登录成功'
      );
    } catch (error: any) {
      console.error('Admin login error:', error);
      return err(ResponseCode.INTERNAL_ERROR, '登录失败');
    }
  },
  {
    body: t.Object({
      username: t.String({ description: '管理员用户名' }),
      password: t.String({ description: '管理员密码' }),
    }),
    detail: {
      tags: ['管理员-认证'],
      summary: '管理员登录',
      description: '使用 .env 中配置的管理员账号登录',
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Object({
          admin: t.Object({
            username: t.String(),
            isAdmin: t.Boolean(),
          }),
          token: t.String(),
        }),
        timestamp: t.Number(),
      }),
    },
  }
);
