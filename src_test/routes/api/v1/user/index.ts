import { Elysia, t } from 'elysia';
import { AuthService } from '@_text/services/auth.service';
import { requireAuth, authMiddleware } from '@_text/middleware/auth.middleware';
import { jwt } from '@elysiajs/jwt';
import { config } from '@_text/config';

export const userRoutes = new Elysia()
  // 使用JWT插件
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwt.accessSecret,
      exp: config.jwt.accessExpires,
    })
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: config.jwt.refreshSecret,
      exp: config.jwt.refreshExpires,
    })
  )
  // 使用认证中间件
  .use(authMiddleware)

  // 用户注册
  .post(
    '/register',
    async ({ body }) => {
      const { username, password, nickname, avatar } = body;

      const result = await AuthService.register(username, password, nickname, avatar);

      return {
        success: result.success,
        message: result.message,
        data: result.success ? { userId: result.userId } : undefined,
      };
    },
    {
      body: t.Object({
        username: t.String({
          description: '用户名（必须是有效的邮箱格式）',
        }),
        password: t.String({
          description: '密码',
        }),
        nickname: t.Optional(
          t.String({
            description: '昵称（可选）',
          })
        ),
        avatar: t.Optional(
          t.String({
            description: '头像URL（可选）',
          })
        ),
      }),
      detail: {
        summary: '用户注册',
        description: '注册新用户，用户名必须是有效的邮箱格式',
        tags: ['用户'],
        responses: {
          '200': {
            description: '注册成功或失败的结果',
            content: {
              'application/json': {
                schema: t.Object({
                  success: t.Boolean(),
                  message: t.String(),
                  data: t.Optional(
                    t.Object({
                      userId: t.Number(),
                    })
                  ),
                }),
              },
            },
          },
        },
      },
    }
  )

  // 登录
  .post(
    '/login',
    async ({ body, jwt, refreshJwt }) => {
      const { username, password } = body;

      const result = await AuthService.login(username, password, jwt.sign, refreshJwt.sign);

      if (!result) {
        return {
          success: false,
          message: '邮箱或密码错误',
        };
      }

      return {
        success: true,
        data: result,
      };
    },
    {
      body: t.Object({
        username: t.String({
          description: '用户名（邮箱）',
        }),
        password: t.String({
          description: '密码',
        }),
      }),
      detail: {
        summary: '用户登录',
        description: '使用邮箱和密码登录系统，获取访问令牌和刷新令牌',
        tags: ['用户'],
        responses: {
          '200': {
            description: '登录成功返回用户信息和令牌',
            content: {
              'application/json': {
                schema: t.Object({
                  success: t.Boolean(),
                  message: t.Optional(t.String()),
                  data: t.Optional(
                    t.Object({
                      user: t.Object({
                        id: t.Number(),
                        username: t.String(),
                        nickname: t.Optional(t.String()),
                        avatar: t.Optional(t.String()),
                      }),
                      roles: t.Array(t.String()),
                      permissions: t.Array(t.String()),
                      extraPermissions: t.Array(t.String()),
                      accessToken: t.String(),
                      refreshToken: t.String(),
                      expires: t.String(),
                    })
                  ),
                }),
              },
            },
          },
        },
      },
    }
  )

  // 刷新令牌
  .post(
    '/refresh-token',
    async ({ body, jwt, refreshJwt }) => {
      const { refreshToken } = body;

      const result = await AuthService.refreshToken(refreshToken, jwt.sign, refreshJwt.verify);

      if (!result) {
        return {
          success: false,
          message: '无效的刷新令牌',
        };
      }

      return {
        success: true,
        data: result,
      };
    },
    {
      body: t.Object({
        refreshToken: t.String({
          description: '刷新令牌',
        }),
      }),
      detail: {
        summary: '刷新访问令牌',
        description: '使用刷新令牌获取新的访问令牌',
        tags: ['用户'],
        responses: {
          '200': {
            description: '返回新的访问令牌',
            content: {
              'application/json': {
                schema: t.Object({
                  success: t.Boolean(),
                  message: t.Optional(t.String()),
                  data: t.Optional(
                    t.Object({
                      accessToken: t.String(),
                      expires: t.String(),
                    })
                  ),
                }),
              },
            },
          },
        },
      },
    }
  )

  // 获取用户信息
  .group('/auth', (app) =>
    app.use(requireAuth).get(
      '/info',
      async ({ user, userRoles, userPermissions, userExtraPermissions }) => {
        return {
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
            },
            roles: userRoles,
            permissions: userPermissions,
            extraPermissions: userExtraPermissions,
          },
        };
      },
      {
        detail: {
          summary: '获取当前用户信息',
          description: '获取当前登录用户的详细信息，包括角色和权限',
          tags: ['用户'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: '返回用户信息',
              content: {
                'application/json': {
                  schema: t.Object({
                    success: t.Boolean(),
                    data: t.Object({
                      user: t.Object({
                        id: t.Number(),
                        username: t.String(),
                        nickname: t.Optional(t.String()),
                        avatar: t.Optional(t.String()),
                      }),
                      roles: t.Array(t.String()),
                      permissions: t.Array(t.String()),
                      extraPermissions: t.Array(t.String()),
                    }),
                  }),
                },
              },
            },
            '401': {
              description: '未授权',
              content: {
                'application/json': {
                  schema: t.Object({
                    success: t.Boolean(),
                    message: t.String(),
                  }),
                },
              },
            },
          },
        },
      }
    )
  );
