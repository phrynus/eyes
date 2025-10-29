import { Elysia } from 'elysia';

// 导入所有路由
import authRoutes from './auth';
import userRoutes from './user';

export default new Elysia({ prefix: '/v1' })
  .use(authRoutes) // 认证路由
  .use(userRoutes); // 用户路由
