import { mysql } from '~/config/mysql';
import { sql, randomUUIDv7 } from 'bun';
import { passwordUtils } from '~/utils/password.utils';
import { regexPatterns } from '~/config';
import * as OTPAuth from 'otpauth';

// -- 用户表：存储系统用户基本信息
// CREATE TABLE users (
//     -- 用户ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
//     -- UUID, 32位长度，非空，唯一
//     uuid VARCHAR(36) NOT NULL COMMENT 'UUID',
//     -- 用户名，最长50字符，非空，唯一
//     username VARCHAR(50) NOT NULL COMMENT '用户名',
//     -- 密码哈希，最长255字符，非空（存储加密后的密码）
//     password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
//     -- TOTP秘钥，255字符（可空，允许用户不提供）
//     totp_secret VARCHAR(255) COMMENT 'TOTP秘钥',
//     -- 邮箱，最长100字符，唯一（可空，允许用户不提供）
//     email VARCHAR(100) UNIQUE COMMENT '邮箱',
//     -- 昵称，最长100字符（可空）
//     nickname VARCHAR(100) COMMENT '昵称',
//     -- 头像URL，最长255字符（可空，用户可能没有设置头像）
//     avatar_url VARCHAR(255) COMMENT '头像URL',
//     -- 扩展数据，JSON格式（可空）
//     json_data JSON COMMENT '扩展数据',
//     -- 状态：1-正常，0-禁用，默认1（非空）
//     status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
//     -- 最后登录时间（可空，新用户未登录时为NULL）
//     last_login_at DATETIME COMMENT '最后登录时间',
//     -- 创建时间，非空，默认当前时间
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//     -- 更新时间，非空，默认当前时间，更新时自动刷新
//     updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
//     -- 主键约束：以id作为主键
//     PRIMARY KEY (id),
//     -- 唯一索引：确保UUID不重复
//     UNIQUE KEY uk_uuid (uuid)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

export type TypeUsers = {
  id?: number;
  uuid?: string;
  username?: string;
  password_hash?: string;
  totp_secret?: string;
  email?: string;
  nickname?: string;
  avatar_url?: string;
  json_data?: object | string;
  status?: number;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export class Users {
  // 创建用户
  async create(userData: TypeUsers) {
    try {
      // 验证用户名格式
      if (userData.username && !regexPatterns.usernameRegex.test(userData.username)) {
        throw new Error('用户名格式不正确');
      }
      // 验证邮箱格式
      if (userData.email && !regexPatterns.emailRegex.test(userData.email)) {
        throw new Error('邮箱格式不正确');
      }
      // 验证密码格式（如果有密码）
      if (userData.password_hash && !regexPatterns.passwordRegex.test(userData.password_hash)) {
        throw new Error('密码格式不正确');
      }
      // 如果提供了明文密码，需要先哈希
      if (userData.password_hash) {
        userData.password_hash = await passwordUtils.hash(userData.password_hash);
      }
      // 生成 UUID
      userData.uuid = randomUUIDv7();

      userData.avatar_url = userData.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.uuid}`;

      await mysql`
        INSERT INTO users ${sql(userData)}
      `;
      return userData;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // 删除用户
  async deleteUser(id: number | string) {
    try {
      await mysql`
        DELETE FROM users WHERE id = ${id} OR uuid = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // 获取所有用户
  async getAllUsers() {
    try {
      const users = await mysql`
        SELECT id, uuid, username, email, nickname, avatar_url, status, last_login_at, created_at, updated_at
        FROM users
      `;
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // 获取单个用户（通过ID或UUID）
  async getUserById(id: number | string) {
    try {
      const [user] = await mysql`
        SELECT id, uuid, totp_secret, username, email, nickname, avatar_url, json_data, status, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = ${id} OR uuid = ${id}
      `;
      return user || null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }
  // 按用户名或邮箱查询用户
  async getUserByUsernameOrEmail(usernameOrEmail: string) {
    try {
      const [user] = await mysql`
        SELECT * FROM users WHERE username = ${usernameOrEmail} OR email = ${usernameOrEmail}
      `;
      return user || null;
    } catch (error) {
      console.error('Error getting user by username or email:', error);
      return null;
    }
  }

  // 按用户名查询用户
  async getUserByUsername(username: string) {
    try {
      const [user] = await mysql`
        SELECT * FROM users WHERE username = ${username}
      `;
      return user || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  // 按邮箱查询用户
  async getUserByEmail(email: string) {
    try {
      const [user] = await mysql`
        SELECT * FROM users WHERE email = ${email}
      `;
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // 更新用户信息
  async updateUser(id: number | string, userData: TypeUsers) {
    try {
      // 移除不应该被更新的字段
      const { id: _, uuid: __, created_at: ___, ...updateData } = userData as any;

      if (Object.keys(updateData).length === 0) {
        return false;
      }

      await mysql`
        UPDATE users 
        SET ${sql(updateData)}
        WHERE id = ${id} OR uuid = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // 更新最后登录时间
  async updateLastLogin(id: number | string) {
    try {
      await mysql`
        UPDATE users 
        SET last_login_at = NOW()
        WHERE id = ${id} OR uuid = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating last login:', error);
      return false;
    }
  }

  // 更新密码
  async updatePassword(id: number | string, newPassword: string) {
    try {
      const passwordHash = await passwordUtils.hash(newPassword);
      await mysql`
        UPDATE users 
        SET password_hash = ${passwordHash}
        WHERE id = ${id} OR uuid = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  // 设置 TOTP 密钥
  async setTotpSecret(id: number | string, totpSecret: string) {
    try {
      await mysql`
        UPDATE users 
        SET totp_secret = ${totpSecret}
        WHERE id = ${id} OR uuid = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error setting TOTP secret:', error);
      return false;
    }
  }
}
export default { Users };
