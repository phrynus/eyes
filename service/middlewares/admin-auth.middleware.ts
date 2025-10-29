import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { jwtConfig } from '~/config';
import { err, ResponseCode } from '~/utils/response.utils';
import { passwordUtils } from '~/utils/password.utils';

// 管理员 JWT 插件配置（使用 access token 配置）
export const jwtAdminPlugin = new Elysia({ name: 'jwt-admin' }).use(
  jwt({
    name: 'jwtAdmin',
    secret: jwtConfig.access.secret,
    exp: jwtConfig.access.exp,
  })
);

// 管理员认证中间件 - 验证管理员 token
export const adminAuthMiddleware = () =>
  new Elysia({ name: 'admin-auth' }).use(jwtAdminPlugin).derive({ as: 'scoped' }, async ({ jwtAdmin, headers }) => {
    // 从 Authorization header 获取 token
    const authHeader = headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      err(ResponseCode.UNAUTHORIZED, '未提供管理员认证令牌');
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    try {
      // 验证 token
      const payload = await jwtAdmin.verify(token);

      if (!payload) {
        err(ResponseCode.UNAUTHORIZED, '无效的管理员认证令牌');
      }

      const { isAdmin, adminId } = payload as any;

      // 验证是否是管理员 token
      if (!isAdmin) {
        err(ResponseCode.FORBIDDEN, '需要管理员权限');
      }

      // 将管理员信息注入到上下文
      return {
        admin: {
          username: adminId,
          isAdmin: true,
        },
      };
    } catch (error) {
      console.error('Admin token verification error:', error);
      err(ResponseCode.UNAUTHORIZED, '管理员认证令牌验证失败');
    }
  });

// 验证管理员登录凭据（从 .env 读取）
export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';

  return username === adminUsername && password === adminPassword;
}
