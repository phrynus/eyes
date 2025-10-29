import { Elysia } from 'elysia';

// 导入所有用户路由
import profileGet from './profile.get';
import passwordPut from './password.put';

export default new Elysia({ prefix: '/user' }).use(profileGet).use(passwordPut);
