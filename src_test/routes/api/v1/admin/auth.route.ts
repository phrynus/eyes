import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '@_text/config';
import { AdminAuthService } from '@_text/services/admin-auth.service';
import { adminAuthMiddleware } from '@_text/middleware/admin-auth.middleware';

// 管理员认证路由
export const adminAuthRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'adminJwt',
      secret: config.admin.jwtSecret,
      exp: `${config.admin.jwtExpires}s`,
    })
  )
  .use(adminAuthMiddleware)

  /**
   * 管理员登录
   */
  .post(
    '/login',
    async ({ body, adminJwt, set }) => {
      const { username, password } = body;

      const loginResult = await AdminAuthService.login(username, password, adminJwt.sign);

      if (!loginResult) {
        set.status = 401;
        return {
          success: false,
          message: '用户名或密码错误',
        };
      }

      return {
        success: true,
        data: loginResult,
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      detail: {
        tags: ['管理员认证'],
        summary: '管理员登录',
        description: '使用固定的管理员账户和密码登录系统，获取访问令牌',
      },
    }
  )

  /**
   * 管理员令牌续期
   */
  .post(
    '/refresh',
    async ({ body, adminJwt, set }) => {
      const { token } = body;

      const refreshResult = await AdminAuthService.refreshToken(token, adminJwt.sign, adminJwt.verify);

      if (!refreshResult) {
        set.status = 401;
        return {
          success: false,
          message: '无效的令牌',
        };
      }

      return {
        success: true,
        data: refreshResult,
      };
    },
    {
      body: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ['管理员认证'],
        summary: '管理员令牌续期',
        description: '使用有效的管理员令牌获取新的访问令牌',
      },
    }
  )

  /**
   * 验证管理员令牌
   */
  .get(
    '/verify',
    async ({ adminAuth }) => {
      const authResult = await adminAuth();

      if (!authResult.success) {
        return authResult;
      }

      return {
        success: true,
        message: '令牌有效',
      };
    },
    {
      beforeHandle: async ({ adminAuth, set }) => {
        const authResult = await adminAuth();
        if (!authResult.success) {
          set.status = 401;
          return authResult;
        }
      },
      detail: {
        tags: ['管理员认证'],
        summary: '验证管理员令牌',
        description: '验证当前管理员令牌是否有效',
        security: [{ BearerAuth: [] }],
      },
    }
  );
