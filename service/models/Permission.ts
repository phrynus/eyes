import { mysql } from '~/config/mysql';
import { sql } from 'bun';

// -- 权限表：存储应用中的权限定义
// CREATE TABLE permissions (
//     -- 权限ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权限ID',
//     -- 应用ID，关联applications表，非空，权限属于哪个应用
//     app_id BIGINT UNSIGNED NOT NULL COMMENT '应用ID',
//     -- 权限编码，最长100字符，非空，格式为resource:target:action
//     permission_code VARCHAR(100) NOT NULL COMMENT '权限编码，格式为resource:target:action',
//     -- 权限名称，最长200字符，非空
//     permission_name VARCHAR(200) NOT NULL COMMENT '权限名称',
//     -- 权限描述，文本类型（可空）
//     description TEXT COMMENT '权限描述',
//     -- 状态：1-启用，0-禁用，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保应用中权限编码不重复，配合前面的idx_app索引
//     UNIQUE KEY uk_app_permission (app_id, permission_code),
//     -- 普通索引：优化按权限编码查询的速度
//     KEY idx_permission_code (permission_code),
//     -- 外键约束：关联应用表，删除应用时级联删除权限
//     CONSTRAINT fk_permission_app FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

export type TypePermission = {
  id?: number;
  app_id?: number;
  permission_code?: string;
  permission_name?: string;
  description?: string;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
};

export class Permissions {
  // 创建权限
  async create(permissionData: TypePermission) {
    try {
      await mysql`
        INSERT INTO permissions ${sql(permissionData)}
      `;
      return permissionData;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  // 获取权限列表
  async getAllPermissions() {
    try {
      const permissions = await mysql`
        SELECT p.*, a.app_name, a.app_code
        FROM permissions p
        LEFT JOIN applications a ON p.app_id = a.id
      `;
      return permissions;
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return [];
    }
  }

  // 获取单个权限
  async getPermissionById(id: number | string) {
    try {
      const [permission] = await mysql`
        SELECT p.*, a.app_name, a.app_code
        FROM permissions p
        LEFT JOIN applications a ON p.app_id = a.id
        WHERE p.id = ${id}
      `;
      return permission || null;
    } catch (error) {
      console.error('Error getting permission by id:', error);
      return null;
    }
  }

  // 按应用获取权限列表
  async getPermissionsByAppId(appId: number | string) {
    try {
      const permissions = await mysql`
        SELECT * FROM permissions 
        WHERE app_id = ${appId}
      `;
      return permissions;
    } catch (error) {
      console.error('Error getting permissions by app id:', error);
      return [];
    }
  }

  // 更新权限
  async updatePermission(id: number | string, permissionData: TypePermission) {
    try {
      const { id: _, created_at: __, ...updateData } = permissionData as any;

      if (Object.keys(updateData).length === 0) {
        return false;
      }

      await mysql`
        UPDATE permissions 
        SET ${sql(updateData)}
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating permission:', error);
      return false;
    }
  }

  // 删除权限
  async deletePermission(id: number | string) {
    try {
      await mysql`
        DELETE FROM permissions WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting permission:', error);
      return false;
    }
  }
}

export default { Permissions };
