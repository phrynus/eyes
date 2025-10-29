import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { jwtConfig } from '~/config';
import { err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

// JWT 插件配置
export const jwtAccessPlugin = new Elysia({ name: 'jwt-access' }).use(
  jwt({
    name: 'jwtAccess',
    secret: jwtConfig.access.secret,
    exp: jwtConfig.access.exp,
  })
);

export const jwtRefreshPlugin = new Elysia({ name: 'jwt-refresh' }).use(
  jwt({
    name: 'jwtRefresh',
    secret: jwtConfig.refresh.secret,
    exp: jwtConfig.refresh.exp,
  })
);

// 认证中间件 - 验证 access token
export const authMiddleware = () =>
  new Elysia({ name: 'auth' }).use(jwtAccessPlugin).derive({ as: 'scoped' }, async ({ jwtAccess, request, headers }) => {
    const authHeader = headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw err(ResponseCode.UNAUTHORIZED, '未提供认证令牌');
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    try {
      // 验证 token
      const payload = await jwtAccess.verify(token);

      if (!payload) {
        throw err(ResponseCode.UNAUTHORIZED, '无效的认证令牌');
      }

      // 获取用户信息
      const user = await models.user.getUserById((payload as any).userId);

      if (!user) {
        throw err(ResponseCode.UNAUTHORIZED, '用户不存在');
      }

      if (user.status !== 1) {
        throw err(ResponseCode.FORBIDDEN, '用户已被禁用');
      }

      // 将用户信息注入到上下文
      return {
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          status: user.status,
        },
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw err(ResponseCode.UNAUTHORIZED, '认证令牌验证失败');
    }
  });

// 可选认证中间件 - 如果有 token 则验证，没有则跳过
export const optionalAuthMiddleware = () =>
  new Elysia({ name: 'optional-auth' }).use(jwtAccessPlugin).derive({ as: 'scoped' }, async ({ jwtAccess, headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = authHeader.substring(7);

    try {
      const payload = await jwtAccess.verify(token);

      if (!payload) {
        return { user: null };
      }

      const user = await models.user.getUserById((payload as any).userId);

      if (!user || user.status !== 1) {
        return { user: null };
      }

      return {
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          status: user.status,
        },
      };
    } catch (error) {
      return { user: null };
    }
  });
