import { db } from '@/config/database';

// -- 用户-应用关联表：记录用户与应用的关系
// CREATE TABLE user_applications (
//     -- 关联ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关联ID',
//     -- 用户ID，关联users表，非空
//     user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
//     -- 应用ID，关联applications表，非空
//     app_id BIGINT UNSIGNED NOT NULL COMMENT '应用ID',
//     -- 状态：1-有效，0-无效，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保用户与应用的关联关系唯一
//     UNIQUE KEY uk_user_app (user_id, app_id),
//     -- 普通索引：优化按应用查询用户的速度
//     KEY idx_app_user (app_id, user_id),
//     -- 外键约束：关联用户表，删除用户时级联删除关联
//     CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//     -- 外键约束：关联应用表，删除应用时级联删除关联
//     CONSTRAINT fk_ua_app FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-应用关联表';

export type TypeUserApplication = {
  id?: number;
  user_id?: number;
  app_id?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
};
