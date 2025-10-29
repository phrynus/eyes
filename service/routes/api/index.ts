import { Elysia } from 'elysia';

//
import regRet from './v1';
//

export default new Elysia({ prefix: '/api' }).use(regRet); // 注册路由
