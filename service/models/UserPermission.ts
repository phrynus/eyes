import { mysql } from '~/config/mysql';
import { sql } from 'bun';

// -- 用户-权限关联表：记录用户的直接权限（不通过角色）
// CREATE TABLE user_permissions (
//     -- 关联ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关联ID',
//     -- 用户ID，关联users表，非空
//     user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
//     -- 应用ID，关联applications表，非空
//     app_id BIGINT UNSIGNED NOT NULL COMMENT '应用ID',
//     -- 权限ID，关联permissions表，非空
//     permission_id BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
//     -- 状态：1-有效，0-无效，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
//     -- 过期时间（可空，NULL表示永不过期）
//     expire_time DATETIME COMMENT '过期时间，NULL表示永不过期',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保用户在应用中的权限唯一
//     UNIQUE KEY uk_user_app_permission (user_id, app_id, permission_id),
//     -- 普通索引：优化按应用查询用户权限的速度
//     KEY idx_app_user (app_id, user_id),
//     -- 普通索引：优化按过期时间查询的速度
//     KEY idx_expire_time (expire_time),
//     -- 外键约束：关联用户表，删除用户时级联删除关联
//     CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//     -- 外键约束：关联应用表，删除应用时级联删除关联
//     CONSTRAINT fk_up_app FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE,
//     -- 外键约束：关联权限表，删除权限时级联删除关联
//     CONSTRAINT fk_up_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-权限关联表';

export type TypeUserPermission = {
  id?: number;
  user_id?: number;
  app_id?: number;
  permission_id?: number;
  status?: number;
  expire_time?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export class UserPermissions {
  // 创建用户权限关联
  async create(userPermissionData: TypeUserPermission) {
    try {
      await mysql`
        INSERT INTO user_permissions ${sql(userPermissionData)}
      `;
      return userPermissionData;
    } catch (error) {
      console.error('Error creating user permission:', error);
      throw error;
    }
  }

  // 删除用户权限关联
  async deleteUserPermission(id: number | string) {
    try {
      await mysql`
        DELETE FROM user_permissions WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting user permission:', error);
      return false;
    }
  }

  // 删除用户的特定权限
  async deleteUserPermissionByUserAndPermission(userId: number | string, permissionId: number | string) {
    try {
      await mysql`
        DELETE FROM user_permissions 
        WHERE user_id = ${userId} AND permission_id = ${permissionId}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting user permission by user and permission:', error);
      return false;
    }
  }

  // 更新用户权限关联
  async updateUserPermission(id: number | string, userPermissionData: TypeUserPermission) {
    try {
      const { id: _, created_at: __, ...updateData } = userPermissionData as any;

      if (Object.keys(updateData).length === 0) {
        return false;
      }

      await mysql`
        UPDATE user_permissions 
        SET ${sql(updateData)}
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating user permission:', error);
      return false;
    }
  }

  // 获取用户权限关联通过用户ID
  async getUserPermissionsByUserId(userId: number | string) {
    try {
      const userPermissions = await mysql`
        SELECT up.*, p.permission_name, p.permission_code, a.app_name, a.app_code
        FROM user_permissions up
        LEFT JOIN permissions p ON up.permission_id = p.id
        LEFT JOIN applications a ON up.app_id = a.id
        WHERE up.user_id = ${userId} AND up.status = 1
        AND (up.expire_time IS NULL OR up.expire_time > NOW())
      `;
      return userPermissions;
    } catch (error) {
      console.error('Error getting user permissions by user id:', error);
      return [];
    }
  }

  // 获取用户在指定应用中的直接权限
  async getUserPermissionsByUserIdAndAppId(userId: number | string, appId: number | string) {
    try {
      const userPermissions = await mysql`
        SELECT up.*, p.permission_name, p.permission_code
        FROM user_permissions up
        LEFT JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ${userId} AND up.app_id = ${appId} AND up.status = 1
        AND (up.expire_time IS NULL OR up.expire_time > NOW())
      `;
      return userPermissions;
    } catch (error) {
      console.error('Error getting user permissions by user id and app id:', error);
      return [];
    }
  }
}
export default { UserPermissions };
