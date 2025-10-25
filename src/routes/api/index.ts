import { Elysia } from 'elysia';

//
import regRet from './reg';
//

export default new Elysia({ prefix: '/api' }).use(regRet); // 注册路由
