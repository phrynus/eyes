import { Elysia, t } from 'elysia';
import { jwtAccessPlugin, jwtRefreshPlugin } from '~/middlewares/auth.middleware';
import { success, err, ResponseCode } from '~/utils/response.utils';
import { regexPatterns } from '~/config';
import models from '~/models';

export default new Elysia()
  .use(jwtAccessPlugin)
  .use(jwtRefreshPlugin)
  .post(
    '/register',
    async ({ body, jwtAccess, jwtRefresh }: any) => {
      const { username, password, email } = body;

      // 验证必填字段
      if (!username || !password) {
        return err(ResponseCode.BAD_REQUEST, '用户名和密码不能为空');
      }

      // 验证用户名格式
      if (!regexPatterns.usernameRegex.test(username)) {
        return err(ResponseCode.BAD_REQUEST, '用户名格式不正确：4-16位，只能包含字母、数字和下划线');
      }

      // 验证密码格式
      if (!regexPatterns.passwordRegex.test(password)) {
        return err(ResponseCode.BAD_REQUEST, '密码格式不正确：6-24位，允许大小写字母、数字和基本特殊字符');
      }

      // 验证邮箱格式
      if (!regexPatterns.emailRegex.test(email)) {
        return err(ResponseCode.BAD_REQUEST, '邮箱格式不正确');
      }

      try {
        // 检查用户名是否已存在
        const existingUser = await models.user.getUserByUsername(username);
        if (existingUser) {
          return err(ResponseCode.BAD_REQUEST, '用户名已存在');
        }

        // 检查邮箱是否已存在
        if (email) {
          const existingEmail = await models.user.getUserByEmail(email);
          if (existingEmail) {
            return err(ResponseCode.BAD_REQUEST, '邮箱已被使用');
          }
        }

        // 创建用户
        const user = await models.user.create({
          username,
          password_hash: password, // create 方法会自动哈希密码
          email: email || null,
          status: 1,
        });

        // 生成 tokens
        const accessToken = await jwtAccess.sign({ userId: user.uuid });
        const refreshToken = await jwtRefresh.sign({ userId: user.uuid });

        return success(
          {
            user: {
              uuid: user.uuid,
              username: user.username,
              email: user.email,
              nickname: user.nickname,
              avatar_url: user.avatar_url,
            },
            tokens: {
              accessToken,
              refreshToken,
            },
          },
          '注册成功'
        );
      } catch (error: any) {
        console.error('Register error:', error);
        return err(ResponseCode.INTERNAL_ERROR, error.message || '注册失败');
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 4, maxLength: 16, description: '用户名' }),
        password: t.String({ minLength: 6, maxLength: 24, description: '密码' }),
        email: t.Optional(t.String({ format: 'email', description: '邮箱' })),
        nickname: t.Optional(t.String({ minLength: 2, maxLength: 16, description: '昵称' })),
      }),
      detail: {
        tags: ['认证'],
        summary: '用户注册',
        description: '创建新用户账户，返回用户信息和 JWT tokens',
      },
      response: {
        200: t.Object({
          code: t.Number(),
          message: t.String(),
          data: t.Object({
            user: t.Object({
              uuid: t.String(),
              username: t.String(),
              email: t.Union([t.String(), t.Null()]),
              nickname: t.Union([t.String(), t.Null()]),
              avatar_url: t.Union([t.String(), t.Null()]),
            }),
            tokens: t.Object({
              accessToken: t.String(),
              refreshToken: t.String(),
            }),
          }),
          timestamp: t.Number(),
        }),
      },
    }
  );
