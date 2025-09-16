import { db } from '@/config/database';
import { sql, randomUUIDv7 } from 'bun';
import { passwordUtils } from '@/utils/password.utils';
import { regexPatterns } from '@/config';
import * as OTPAuth from 'otpauth';

// -- 用户表：存储系统用户基本信息
// CREATE TABLE users (
//     -- 用户ID，无符号大整数，自增，非空
//     id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
//     -- UUID, 32位长度，非空，唯一
//     uuid VARCHAR(32) NOT NULL COMMENT 'UUID',
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
      // if (userData.username) {
      //   if (!regexPatterns.usernameRegex.test(userData.username)) {
      //     throw new Error('Invalid username');
      //   }
      // } else {
      //   throw new Error('Invalid username');
      // }

      // if (userData.password) {
      //   if (!regexPatterns.passwordRegex1.test(userData.password)) {
      //     throw new Error('Invalid password');
      //   }
      //   userData.password_hash = await passwordUtils.hash(userData.password);
      //   delete userData.password;
      // } else {
      //   throw new Error('Invalid password');
      // }

      // if (userData.nickname) {
      //   if (!regexPatterns.nicknameRegex.test(userData.nickname)) {
      //     throw new Error('Invalid nickname');
      //   }
      // } else {
      //   userData.nickname = userData.username;
      // }

      // if (userData.email) {
      //   if (!regexPatterns.emailRegex.test(userData.email)) {
      //     throw new Error('Invalid email');
      //   }
      // }

      // userData.uuid = randomUUIDv7();
      // userData.avatar_url = userData.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.uuid}`;

      // const totp = new OTPAuth.TOTP({
      //   issuer: 'EYES', // 签发者
      //   label: userData.username, // 用户名
      //   algorithm: 'SHA1', // 算法
      // });
      // userData.totp_secret = totp.secret.base32;
      // userData.json_data = JSON.stringify(userData.json_data || {});

      await db`
      INSERT INTO users ${sql(userData)}
      `;
      return userData;
    } catch (error) {
      throw error;
    }
  }
}
