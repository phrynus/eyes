import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authService, jwtConfig, authMiddleware } from '../auth';

// 认证路由
export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt(jwtConfig.access))
  .use(jwt(jwtConfig.refresh))
  
  // 用户注册
  .post('/register', async ({ body, set }) => {
    try {
      const user = await authService.register(body);
      set.status = 201;
      return {
        success: true,
        message: '注册成功',
        data: user
      };
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        message: error.message || '注册失败'
      };
    }
  }, {
    body: t.Object({
      username: t.String({ 
        minLength: 3, 
        maxLength: 50,
        description: '用户名，3-50个字符' 
      }),
      password: t.String({ 
        minLength: 6,
        description: '密码，至少6个字符' 
      }),
      email: t.Optional(t.String({ 
        format: 'email',
        description: '邮箱地址（可选）' 
      })),
      nickname: t.Optional(t.String({ 
        maxLength: 100,
        description: '昵称（可选）' 
      }))
    }),
    detail: {
      summary: '用户注册',
      description: '创建新用户账户',
      tags: ['认证']
    }
  })

  // 用户登录
  .post('/login', async ({ body, set, jwt }) => {
    try {
      const result = await authService.login(body.username, body.password, jwt);
      return {
        success: true,
        message: '登录成功',
        data: result
      };
    } catch (error: any) {
      set.status = 401;
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }, {
    body: t.Object({
      username: t.String({ description: '用户名' }),
      password: t.String({ description: '密码' })
    }),
    detail: {
      summary: '用户登录',
      description: '用户身份验证并获取访问令牌',
      tags: ['认证']
    }
  })

  // 刷新令牌
  .post('/refresh', async ({ body, set, jwt }) => {
    try {
      const result = await authService.refreshToken(body.refresh_token, jwt);
      return {
        success: true,
        message: '令牌刷新成功',
        data: result
      };
    } catch (error: any) {
      set.status = 401;
      return {
        success: false,
        message: error.message || '令牌刷新失败'
      };
    }
  }, {
    body: t.Object({
      refresh_token: t.String({ description: '刷新令牌' })
    }),
    detail: {
      summary: '刷新访问令牌',
      description: '使用刷新令牌获取新的访问令牌',
      tags: ['认证']
    }
  })

  // 获取当前用户信息（需要认证）
  .get('/me', async (context) => {
    const authResult = await authMiddleware(context);
    if (authResult !== true) {
      return authResult;
    }

    return {
      success: true,
      message: '获取用户信息成功',
      data: context.user
    };
  }, {
    detail: {
      summary: '获取当前用户信息',
      description: '获取当前登录用户的基本信息',
      tags: ['认证'],
      security: [{ bearerAuth: [] }]
    }
  })

  // 用户登出（可选实现，主要是客户端删除令牌）
  .post('/logout', async ({ set }) => {
    // 在实际应用中，可以将令牌加入黑名单
    // 这里简单返回成功消息
    return {
      success: true,
      message: '登出成功'
    };
  }, {
    detail: {
      summary: '用户登出',
      description: '用户登出系统',
      tags: ['认证']
    }
  });