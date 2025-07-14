import { Elysia } from 'elysia';
import { adminAuthMiddleware } from '@_text/middleware/admin-auth.middleware';

import { userManageRoutes } from './user.route';
import { roleManageRoutes } from './role.route';
import { permissionManageRoutes } from './permission.route';
import { adminAuthRoutes } from './auth.route';

export const adminRoutes = new Elysia()
  // 管理员认证路由（无需认证）
  .group('/auth', (app) => app.use(adminAuthRoutes))

  // 需要常规用户认证和权限的路由
  .use(adminAuthMiddleware)
  .group('/user', (app) => app.use(userManageRoutes))
  .group('/role', (app) => app.use(roleManageRoutes))
  .group('/permission', (app) => app.use(permissionManageRoutes));
