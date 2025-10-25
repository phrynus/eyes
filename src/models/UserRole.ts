import { mysql } from '~/config/mysql';

// -- 用户-角色关联表：记录用户在某应用中拥有的角色
// CREATE TABLE user_roles (
//     -- 关联ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关联ID',
//     -- 用户ID，关联users表，非空
//     user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
//     -- 应用ID，关联applications表，非空，配合后面的索引提高查询效率
//     app_id BIGINT UNSIGNED NOT NULL COMMENT '应用ID',
//     -- 角色ID，关联roles表，非空
//     role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
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
//     -- 唯一索引：确保用户在应用中的角色唯一
//     UNIQUE KEY uk_user_app_role (user_id, app_id, role_id),
//     -- 普通索引：优化按应用查询用户角色的速度
//     KEY idx_app_user (app_id, user_id),
//     -- 普通索引：优化按过期时间查询的速度
//     KEY idx_expire_time (expire_time),
//     -- 外键约束：关联用户表，删除用户时级联删除关联
//     CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//     -- 外键约束：关联应用表，删除应用时级联删除关联
//     CONSTRAINT fk_ur_app FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE,
//     -- 外键约束：关联角色表，删除角色时级联删除关联
//     CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';

export type TypeUserRole = {
  id?: number;
  user_id?: number;
  app_id?: number;
  role_id?: number;
  status?: number;
  expire_time?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export class UserRoles {
  // 创建用户-角色关联
  async create(userRoleData: TypeUserRole) {}
  // 删除用户-角色关联
  async deleteUserRole(id: number | string) {}
  // 更新用户-角色关联
  async updateUserRole(id: number | string, userRoleData: TypeUserRole) {}
  // 获取用户-角色关联通过用户ID
  async getUserRolesByUserId(userId: number | string) {}
}
