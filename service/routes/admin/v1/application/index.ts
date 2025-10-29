import { Elysia } from 'elysia';

// 导入所有应用管理路由
import createPost from './create.post';
import listGet from './list.get';
import itemGet from './item.get';
import itemPut from './item.put';
import itemDelete from './item.delete';

export default new Elysia({ prefix: '/application' }).use(createPost).use(listGet).use(itemGet).use(itemPut).use(itemDelete);
