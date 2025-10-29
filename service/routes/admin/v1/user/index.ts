import { Elysia } from 'elysia';

// 导入所有用户管理路由
import listGet from './list.get';
import itemGet from './item.get';
import itemPut from './item.put';
import itemDelete from './item.delete';

export default new Elysia({ prefix: '/user' }).use(listGet).use(itemGet).use(itemPut).use(itemDelete);
