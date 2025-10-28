// 导出所有模型
import { Users } from './User';
import { Applications } from './Application';
import { UserApplications } from './UserApplication';
import { Roles } from './Role';
import { UserRoles } from './UserRole';
import { Permissions } from './Permission';
import { UserPermissions } from './UserPermission';
import { RolePermissions } from './RolePermission';

// 默认导出所有模型
export default {
  user: new Users(),
  application: new Applications(),
  userApplication: new UserApplications(),
  role: new Roles(),
  userRole: new UserRoles(),
  permission: new Permissions(),
  userPermission: new UserPermissions(),
  rolePermission: new RolePermissions(),
};
