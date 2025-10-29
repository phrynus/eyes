import { Elysia } from 'elysia';

// 导入管理员 v1 路由
import adminV1Routes from './v1';

export default new Elysia({ prefix: '/admin' }).use(adminV1Routes);
