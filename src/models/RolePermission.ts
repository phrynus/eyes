import { db } from '@/config/database';

// -- 角色-权限关联表：记录角色拥有的权限
// CREATE TABLE role_permissions (
//     -- 关联ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关联ID',
//     -- 角色ID，关联roles表，非空
//     role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
//     -- 权限ID，关联permissions表，非空
//     permission_id BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保角色与权限的关联关系唯一
//     UNIQUE KEY uk_role_permission (role_id, permission_id),
//     -- 普通索引：优化按权限查询角色的速度
//     KEY idx_permission_role (permission_id, role_id),
//     -- 外键约束：关联角色表，删除角色时级联删除关联
//     CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
//     -- 外键约束：关联权限表，删除权限时级联删除关联
//     CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

export type TypeRolePermission = {
  id?: number;
  role_id?: number;
  permission_id?: number;
  created_at?: Date;
  updated_at?: Date;
};
