import { UserModel } from '@_text/models/user.model';
import { RoleModel } from '@_text/models/role.model';
import { PermissionModel } from '@_text/models/permission.model';
import { LoginResult, AuthPayload } from '@_text/types';
import { config } from '@_text/config';

export class AuthService {
  // 验证邮箱格式
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 用户注册
  static async register(username: string, password: string, nickname?: string, avatar?: string): Promise<{ success: boolean; message: string; userId?: number }> {
    // 验证邮箱格式
    if (!this.validateEmail(username)) {
      return {
        success: false,
        message: '邮箱格式无效',
      };
    }

    // 检查用户名是否已存在
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return {
        success: false,
        message: '该邮箱已被注册',
      };
    }

    try {
      // 创建用户
      const user = await UserModel.create({
        username: username,
        password,
        nickname: nickname || username.split('@')[0], // 如果没有提供昵称，使用邮箱前缀
        avatar,
        email: username,
      });

      // 可以在这里为新用户分配默认角色
      // 例如：await RoleModel.addUserRole(user.id, defaultRoleId);

      return {
        success: true,
        message: '注册成功',
        userId: user.id,
      };
    } catch (error) {
      console.error('用户注册失败:', error);
      return {
        success: false,
        message: '注册失败，请稍后重试',
      };
    }
  }

  static async login(username: string, password: string, jwtSign: (payload: any) => Promise<string>, refreshJwtSign: (payload: any) => Promise<string>): Promise<LoginResult | null> {
    // 检查是否是邮箱格式
    const isEmail = this.validateEmail(username);

    // 根据用户名（邮箱）查找用户
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await UserModel.verifyPassword(user, password);

    if (!isPasswordValid) {
      return null;
    }

    // 获取用户角色
    const roles = await RoleModel.getUserRoles(user.id);
    const roleCodes = roles.map((role) => role.code);

    // 获取用户所有权限（包括角色权限和额外权限）
    const permissions = await PermissionModel.getAllUserPermissions(user.id);
    const permissionCodes = permissions.map((permission) => permission.code);

    // 获取用户额外权限
    const extraPermissions = await PermissionModel.getUserPermissions(user.id);
    const extraPermissionCodes = extraPermissions.map((permission) => permission.code);

    // 生成令牌
    const payload: AuthPayload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await jwtSign(payload);
    const refreshToken = await refreshJwtSign(payload);

    // 计算过期时间
    const expiresDate = new Date();
    expiresDate.setSeconds(expiresDate.getSeconds() + config.jwt.accessExpires);

    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
      },
      roles: roleCodes,
      permissions: permissionCodes,
      extraPermissions: extraPermissionCodes,
      accessToken,
      refreshToken,
      expires: expiresDate.toISOString(),
    };
  }

  static async refreshToken(
    refreshToken: string,
    jwtSign: (payload: any) => Promise<string>,
    refreshJwtVerify: (token: string) => Promise<any>
  ): Promise<{ accessToken: string; expires: string } | null> {
    const payload = (await refreshJwtVerify(refreshToken)) as AuthPayload | null;

    if (!payload) {
      return null;
    }

    const user = await UserModel.findById(payload.sub);

    if (!user) {
      return null;
    }

    // 生成新的访问令牌
    const newPayload: AuthPayload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await jwtSign(newPayload);

    // 计算过期时间
    const expiresDate = new Date();
    expiresDate.setSeconds(expiresDate.getSeconds() + config.jwt.accessExpires);

    return {
      accessToken,
      expires: expiresDate.toISOString(),
    };
  }

  // 验证用户是否有指定权限
  static async hasPermission(userId: number, requiredPermission: string): Promise<boolean> {
    // 获取用户所有权限
    const permissions = await PermissionModel.getAllUserPermissions(userId);
    const permissionCodes = permissions.map((permission) => permission.code);

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
  }
}
