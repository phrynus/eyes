import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { config } from '@_text/config';
import { AdminAuthService } from '@_text/services/admin-auth.service';

// 导出管理员认证中间件

export const adminAuthMiddleware = (app: Elysia) =>
  app
    .use(
      jwt({
        name: 'adminJwt',
        secret: config.admin.jwtSecret,
        exp: `${config.admin.jwtExpires}s`,
      })
    )
    .derive({ as: 'global' }, async ({ adminJwt, headers, set }) => {
      // 管理员认证处理
      console.log(headers);
      // 从Authorization头获取令牌
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        throw { success: false, message: '未授权访问' };
      }

      const token = authHeader.slice(7);
      const verifyResult = await AdminAuthService.verifyToken(token, adminJwt.verify);

      if (!verifyResult.valid) {
        set.status = 401;
        throw { success: false, message: '无效的管理员令牌' };
      }

      return { success: true, payload: verifyResult.payload };
    });
