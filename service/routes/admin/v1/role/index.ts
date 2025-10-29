import { Elysia } from 'elysia';

// 导入所有角色管理路由
import createPost from './create.post';
import listGet from './list.get';
import itemGet from './item.get';
import itemPut from './item.put';
import itemDelete from './item.delete';
import permissionsPost from './permissions.post';
import permissionsDelete from './permissions.delete';

export default new Elysia({ prefix: '/role' }).use(createPost).use(listGet).use(itemGet).use(itemPut).use(itemDelete).use(permissionsPost).use(permissionsDelete);
