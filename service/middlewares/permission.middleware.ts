import { Elysia } from 'elysia';
import { err, ResponseCode } from '~/utils/response.utils';
import models from '~/models';

// 权限验证中间件 - 检查用户是否拥有指定权限
export const checkPermission = (permissionCode: string, appId?: number | string) =>
  new Elysia({ name: 'check-permission' }).derive({ as: 'scoped' }, async ({ user }: any) => {
    if (!user) {
      err(ResponseCode.UNAUTHORIZED, '需要登录才能访问');
    }

    try {
      // 获取用户的所有权限（包括角色权限和直接权限）
      const hasPermission = await checkUserPermission(user.id, permissionCode, appId);

      if (!hasPermission) {
        err(ResponseCode.FORBIDDEN, '权限不足');
      }

      return {};
    } catch (error) {
      console.error('Permission check error:', error);
      err(ResponseCode.FORBIDDEN, '权限验证失败');
    }
  });

// 角色验证中间件 - 检查用户是否拥有指定角色
export const checkRole = (roleCode: string, appId?: number | string) =>
  new Elysia({ name: 'check-role' }).derive(async ({ user }: any) => {
    if (!user) {
      err(ResponseCode.UNAUTHORIZED, '需要登录才能访问');
    }

    try {
      // 获取用户的所有角色
      const hasRole = await checkUserRole(user.id, roleCode, appId);

      if (!hasRole) {
        err(ResponseCode.FORBIDDEN, '角色权限不足');
      }

      return {};
    } catch (error) {
      console.error('Role check error:', error);
      err(ResponseCode.FORBIDDEN, '角色验证失败');
    }
  });

// 管理员验证中间件 - 检查用户是否是管理员
export const checkAdmin = () =>
  new Elysia({ name: 'check-admin' }).derive(async ({ user }: any) => {
    if (!user) {
      err(ResponseCode.UNAUTHORIZED, '需要登录才能访问');
    }

    try {
      // 检查用户是否有管理员角色（假设管理员角色编码为 'admin'）
      const hasAdminRole = await checkUserRole(user.id, 'admin');

      if (!hasAdminRole) {
        err(ResponseCode.FORBIDDEN, '需要管理员权限');
      }

      return {};
    } catch (error) {
      console.error('Admin check error:', error);
      err(ResponseCode.FORBIDDEN, '管理员权限验证失败');
    }
  });

// 辅助函数：检查用户是否有指定权限
async function checkUserPermission(userId: number | string, permissionCode: string, appId?: number | string): Promise<boolean> {
  try {
    // 1. 获取用户的直接权限
    const directPermissions = appId ? await models.userPermission.getUserPermissionsByUserIdAndAppId(userId, appId) : await models.userPermission.getUserPermissionsByUserId(userId);

    // 检查直接权限
    const hasDirectPermission = directPermissions.some((p: any) => p.permission_code === permissionCode);

    if (hasDirectPermission) {
      return true;
    }

    // 2. 获取用户的角色
    const userRoles = appId ? await models.userRole.getUserRolesByUserIdAndAppId(userId, appId) : await models.userRole.getUserRolesByUserId(userId);

    // 3. 获取角色的权限
    for (const userRole of userRoles) {
      const rolePermissions = await models.rolePermission.getRolePermissionsByRoleId(userRole.role_id);

      const hasRolePermission = rolePermissions.some((p: any) => p.permission_code === permissionCode);

      if (hasRolePermission) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

// 辅助函数：检查用户是否有指定角色
async function checkUserRole(userId: number | string, roleCode: string, appId?: number | string): Promise<boolean> {
  try {
    const userRoles = appId ? await models.userRole.getUserRolesByUserIdAndAppId(userId, appId) : await models.userRole.getUserRolesByUserId(userId);

    return userRoles.some((r: any) => r.role_code === roleCode);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

// 获取用户所有权限（用于返回给前端）
export async function getUserAllPermissions(userId: number | string, appId?: number | string): Promise<string[]> {
  try {
    const permissions = new Set<string>();

    // 1. 获取直接权限
    const directPermissions = appId ? await models.userPermission.getUserPermissionsByUserIdAndAppId(userId, appId) : await models.userPermission.getUserPermissionsByUserId(userId);

    directPermissions.forEach((p: any) => {
      if (p.permission_code) {
        permissions.add(p.permission_code);
      }
    });

    // 2. 获取角色权限
    const userRoles = appId ? await models.userRole.getUserRolesByUserIdAndAppId(userId, appId) : await models.userRole.getUserRolesByUserId(userId);

    for (const userRole of userRoles) {
      const rolePermissions = await models.rolePermission.getRolePermissionsByRoleId(userRole.role_id);

      rolePermissions.forEach((p: any) => {
        if (p.permission_code) {
          permissions.add(p.permission_code);
        }
      });
    }

    return Array.from(permissions);
  } catch (error) {
    console.error('Error getting user all permissions:', error);
    return [];
  }
}
