import { mysql } from '~/config/mysql';
import { sql, randomUUIDv7 } from 'bun';

// -- 应用表：存储所有应用信息
// CREATE TABLE applications (
//     -- 应用ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '应用ID',
//     -- 应用编码，最长50字符，非空，唯一标识应用
//     app_code VARCHAR(50) NOT NULL COMMENT '应用编码，唯一标识',
//     -- 应用名称，最长100字符，非空
//     app_name VARCHAR(100) NOT NULL COMMENT '应用名称',
//     -- 应用描述，文本类型（可空，允许详细描述）
//     description TEXT COMMENT '应用描述',
//     -- 应用图标URL，最长255字符（可空，应用可能没有图标）
//     icon_url VARCHAR(255) COMMENT '应用图标URL',
//     -- 状态：1-启用，0-禁用，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保应用编码不重复
//     UNIQUE KEY uk_app_code (app_code)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用表';

export type TypeApplication = {
  id?: number;
  app_code?: string;
  app_name?: string;
  description?: string;
  icon_url?: string;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
};

export class Applications {
  // 创建应用
  async create(appData: TypeApplication) {
    try {
      await mysql`
        INSERT INTO applications ${sql(appData)}
      `;
      return appData;
    } catch (error) {
      console.error('Error creating application:', error);
      return false;
    }
  }
  // 获取所有应用
  async getAllApplications() {
    try {
      const applications = await mysql`
        SELECT * FROM applications
      `;
      return applications;
    } catch (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
  }
  // 获取单个应用通过 ID 或者 app_code
  async getApplicationById(id: number | string) {
    try {
      const [application] = await mysql`
        SELECT * FROM applications WHERE id = ${id} OR app_code = ${id}
      `;
      return application || null;
    } catch (error) {
      console.error('Error getting application by id:', error);
      return null;
    }
  }

  // 更新应用
  async updateApplication(id: number | string, appData: TypeApplication) {
    try {
      // 移除不应该被更新的字段
      const { id: _, created_at: __, ...updateData } = appData as any;

      if (Object.keys(updateData).length === 0) {
        return false;
      }

      await mysql`
        UPDATE applications 
        SET ${sql(updateData)}
        WHERE id = ${id} OR app_code = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      return false;
    }
  }

  // 删除应用
  async deleteApplication(id: number | string) {
    try {
      await mysql`
        DELETE FROM applications WHERE id = ${id} OR app_code = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }
}

export default { Applications };
