import { Elysia } from 'elysia';

// 导入所有管理员路由
import authRoutes from './auth';
import userRoutes from './user';
import applicationRoutes from './application';
import roleRoutes from './role';
import permissionRoutes from './permission';
import userPermissionRoutes from './user-permission';

export default new Elysia({ prefix: '/v1' })
  .use(authRoutes) // 管理员认证
  .use(userRoutes) // 用户管理
  .use(applicationRoutes) // 应用管理
  .use(roleRoutes) // 角色管理
  .use(permissionRoutes) // 权限管理
  .use(userPermissionRoutes); // 用户权限管理
