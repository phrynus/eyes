import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';

import { config } from '@_text/config';
import { UserModel } from '@_text/models/user.model';
import { RoleModel } from '@_text/models/role.model';
import { PermissionModel } from '@_text/models/permission.model';
import { AuthPayload } from '@_text/types';

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwt.accessSecret,
      exp: config.jwt.accessExpires,
    })
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: config.jwt.refreshSecret,
      exp: config.jwt.refreshExpires,
    })
  )
  .derive(async ({ jwt, refreshJwt, headers, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    const token = authHeader.split(' ')[1];
    const payload = (await jwt.verify(token)) as AuthPayload | null;

    if (!payload) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    const user = await UserModel.findById(payload.sub);

    if (!user) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    return {
      isAuthenticated: true,
      user,
      userId: user.id,
    };
  })
  .derive(async ({ isAuthenticated, userId }) => {
    if (!isAuthenticated || !userId) {
      return {
        userRoles: [],
        userPermissions: [],
        hasPermission: (_: string) => false,
      };
    }

    const roles = await RoleModel.getUserRoles(userId);
    const roleCodes = roles.map((role) => role.code);

    const permissions = await PermissionModel.getAllUserPermissions(userId);
    const permissionCodes = permissions.map((permission) => permission.code);

    const extraPermissions = await PermissionModel.getUserPermissions(userId);
    const extraPermissionCodes = extraPermissions.map((permission) => permission.code);

    // 检查用户是否有指定权限
    const hasPermission = (requiredPermission: string) => {
      // 检查是否有通配符权限
      if (permissionCodes.includes('*:*:*')) {
        return true;
      }

      // 拆分权限代码
      const [reqResource, reqTarget, reqAction] = requiredPermission.split(':');

      // 检查每个权限
      return permissionCodes.some((code) => {
        const [resource, target, action] = code.split(':');

        // 检查资源是否匹配（*表示所有）
        const resourceMatch = resource === '*' || resource === reqResource;
        if (!resourceMatch) return false;

        // 检查目标是否匹配（*表示所有）
        const targetMatch = target === '*' || target === reqTarget;
        if (!targetMatch) return false;

        // 检查操作是否匹配（*表示所有）
        const actionMatch = action === '*' || action === reqAction;
        return actionMatch;
      });
    };

    return {
      userRoles: roleCodes,
      userPermissions: permissionCodes,
      userExtraPermissions: extraPermissionCodes,
      hasPermission,
    };
  });

// 需要身份验证的中间件
export const requireAuth = (app: Elysia) =>
  app.derive({ as: 'global' }, async ({ isAuthenticated, set }) => {
    if (!isAuthenticated) {
      set.status = 404;
      throw { error: '未授权访问' };
    }
  });

// 需要指定权限的中间件
export const requirePermission = (permission: string) => (app: Elysia) =>
  app.derive({ as: 'global' }, async ({ isAuthenticated, hasPermission, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      throw { error: '未授权访问' };
    }

    if (!hasPermission(permission)) {
      set.status = 403;
      throw { error: '权限不足' };
    }
  });
