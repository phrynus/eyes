import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authConfig } from '../config/auth.config';

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'accessJwt',
      secret: authConfig.jwt.accessToken.secret,
      exp: authConfig.jwt.accessToken.expires
    })
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: authConfig.jwt.refreshToken.secret,
      exp: authConfig.jwt.refreshToken.expires
    })
  )
  .derive(({ accessJwt, refreshJwt }) => ({
    // 生成访问令牌
    signAccessToken: async (payload: any) => {
      return await accessJwt.sign(payload);
    },
    // 验证访问令牌
    verifyAccessToken: async (token: string) => {
      return await accessJwt.verify(token);
    },
    // 生成刷新令牌
    signRefreshToken: async (payload: any) => {
      return await refreshJwt.sign(payload);
    },
    // 验证刷新令牌
    verifyRefreshToken: async (token: string) => {
      return await refreshJwt.verify(token);
    }
  })); 