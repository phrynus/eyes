import { Elysia } from 'elysia';

// 导入所有用户权限管理路由
import rolesPost from './roles.post';
import rolesDelete from './roles.delete';
import rolesBatchPost from './roles-batch.post';
import permissionsPost from './permissions.post';
import permissionsDelete from './permissions.delete';
import permissionsGet from './permissions.get';

export default new Elysia({ prefix: '/user-permission' }).use(rolesPost).use(rolesDelete).use(rolesBatchPost).use(permissionsPost).use(permissionsDelete).use(permissionsGet);
