export interface User {
  id: number;
  username: string;
  password: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string; // 格式: resource:target:action
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  userId: number;
  roleId: number;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
}

export interface UserPermission {
  userId: number;
  permissionId: number;
}

export interface LoginResult {
  user: {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
  };
  roles: string[];
  permissions: string[];
  extraPermissions: string[];
  accessToken: string;
  refreshToken: string;
  expires: string;
}

export type AuthPayload = {
  sub: number; // 用户ID
  username: string;
  iat?: number;
  exp?: number;
};
