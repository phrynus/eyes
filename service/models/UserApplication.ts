import { mysql } from '~/config/mysql';
import { sql } from 'bun';

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
export class UserApplications {
  // 创建用户-应用关联
  async create(userApplicationData: TypeUserApplication) {
    try {
      await mysql`
        INSERT INTO user_applications ${sql(userApplicationData)}
      `;
      return userApplicationData;
    } catch (error) {
      console.error('Error creating user application:', error);
      throw error;
    }
  }

  // 删除用户-应用关联
  async deleteUserApplication(id: number | string) {
    try {
      await mysql`
        DELETE FROM user_applications WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting user application:', error);
      return false;
    }
  }

  // 删除用户的特定应用关联
  async deleteUserApplicationByUserAndApp(userId: number | string, appId: number | string) {
    try {
      await mysql`
        DELETE FROM user_applications 
        WHERE user_id = ${userId} AND app_id = ${appId}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting user application by user and app:', error);
      return false;
    }
  }

  // 更新用户-应用关联
  async updateUserApplication(id: number | string, userApplicationData: TypeUserApplication) {
    try {
      const { id: _, created_at: __, ...updateData } = userApplicationData as any;

      if (Object.keys(updateData).length === 0) {
        return false;
      }

      await mysql`
        UPDATE user_applications 
        SET ${sql(updateData)}
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating user application:', error);
      return false;
    }
  }

  // 获取用户-应用关联通过用户ID
  async getUserApplicationsByUserId(userId: number | string) {
    try {
      const userApplications = await mysql`
        SELECT ua.*, a.app_name, a.app_code, a.icon_url
        FROM user_applications ua
        LEFT JOIN applications a ON ua.app_id = a.id
        WHERE ua.user_id = ${userId} AND ua.status = 1
      `;
      return userApplications;
    } catch (error) {
      console.error('Error getting user applications by user id:', error);
      return [];
    }
  }
}
export default { UserApplications };
