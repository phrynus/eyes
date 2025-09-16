import { db } from '@/config/database';

// -- 角色表：存储应用内的角色信息
// CREATE TABLE roles (
//     -- 角色ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
//     -- 应用ID，关联applications表，非空（角色属于特定应用）
//     app_id BIGINT UNSIGNED NOT NULL COMMENT '应用ID',
//     -- 角色编码，最长50字符，非空（应用内唯一）
//     role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
//     -- 角色名称，最长100字符，非空
//     role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
//     -- 角色描述，文本类型（可空）
//     description TEXT COMMENT '角色描述',
//     -- 状态：1-启用，0-禁用，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保应用内角色编码唯一（替代原冗余的idx_app索引）
//     UNIQUE KEY uk_app_role (app_id, role_code),
//     -- 外键约束：关联应用表，删除应用时级联删除角色
//     CONSTRAINT fk_role_app FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

export type TypeRole = {
  id?: number;
  app_id?: number;
  role_code?: string;
  role_name?: string;
  description?: string;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
};