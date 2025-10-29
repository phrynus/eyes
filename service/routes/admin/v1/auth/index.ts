import { Elysia } from 'elysia';

// 导入管理员认证路由
import loginPost from './login.post';

export default new Elysia({ prefix: '/auth' }).use(loginPost);
