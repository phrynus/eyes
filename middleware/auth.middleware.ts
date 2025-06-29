import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authConfig } from '../config/auth.config';

<<<<<<< HEAD
/**
 * 认证中间件
 * 提供JWT令牌的签发和验证功能
 * 
 * 包含两种令牌：
 * 1. 访问令牌（Access Token）：短期有效，用于API访问
 * 2. 刷新令牌（Refresh Token）：长期有效，用于刷新访问令牌
 */
export const authMiddleware = new Elysia()
  // 配置访问令牌
=======
export const authMiddleware = new Elysia()
>>>>>>> 0fd4890d18a1b5b168750f29792b8d2d2db3385f
  .use(
    jwt({
      name: 'accessJwt',
      secret: authConfig.jwt.accessToken.secret,
      exp: authConfig.jwt.accessToken.expires
    })
  )
<<<<<<< HEAD
  // 配置刷新令牌
=======
>>>>>>> 0fd4890d18a1b5b168750f29792b8d2d2db3385f
  .use(
    jwt({
      name: 'refreshJwt',
      secret: authConfig.jwt.refreshToken.secret,
      exp: authConfig.jwt.refreshToken.expires
    })
  )
<<<<<<< HEAD
  // 提供JWT操作方法
  .derive(({ accessJwt, refreshJwt }) => ({
    /**
     * 签发访问令牌
     * @param payload - 令牌载荷
     * @returns 签发的访问令牌
     */
    signAccessToken: async (payload: any) => {
      return await accessJwt.sign(payload);
    },
    /**
     * 验证访问令牌
     * @param token - 访问令牌
     * @returns 令牌载荷或null
     */
    verifyAccessToken: async (token: string) => {
      return await accessJwt.verify(token);
    },
    /**
     * 签发刷新令牌
     * @param payload - 令牌载荷
     * @returns 签发的刷新令牌
     */
    signRefreshToken: async (payload: any) => {
      return await refreshJwt.sign(payload);
    },
    /**
     * 验证刷新令牌
     * @param token - 刷新令牌
     * @returns 令牌载荷或null
     */
=======
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
>>>>>>> 0fd4890d18a1b5b168750f29792b8d2d2db3385f
    verifyRefreshToken: async (token: string) => {
      return await refreshJwt.verify(token);
    }
  })); 