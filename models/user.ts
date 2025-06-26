import { db } from './db';
import { CryptoUtil } from '../utils/crypto';

/**
 * 用户接口定义
 * 包含用户的所有字段，包括敏感信息
 */
export interface User {
  id?: number; // 用户ID
  username: string; // 用户名
  password: string; // 密码
  password_salt?: string; // 密码盐值
  email?: string; // 邮箱
  nickname?: string; // 昵称
  avatar?: string; // 头像URL
  status?: number; // 状态（1: 正常, 0: 禁用）
  last_login_at?: string; // 最后登录时间
  last_login_ip?: string; // 最后登录IP
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}

/**
 * 安全的用户接口定义
 * 用于向客户端返回用户信息，不包含敏感字段
 */
export interface SafeUser {
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  status?: number;
  last_login_at?: string;
  created_at?: string;
  [key: string]: string | number | undefined;
}

/**
 * 用户模型类
 * 处理用户相关的所有数据库操作
 */
export class UserModel {
  /**
   * 创建新用户
   * @param user - 用户信息
   * @returns 新创建的用户ID
   */
  static async create(user: User): Promise<number> {
    try {
      const salt = CryptoUtil.generateSalt();
      const hashedPassword = CryptoUtil.hashPassword(user.password, salt);

      const stmt = db.prepare(`
        INSERT INTO users (
          username, password, password_salt, email, 
          nickname, avatar, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(user.username, hashedPassword, salt, user.email || null, user.nickname || null, user.avatar || null, user.status || 1);

      return Number(result.lastInsertRowid);
    } catch (error: any) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }

  /**
   * 根据用户名查找用户
   * 只返回状态正常的用户
   * @param username - 用户名
   * @returns 用户对象或null
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE username = ? AND status = 1').get(username) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  /**
   * 根据邮箱查找用户
   * 只返回状态正常的用户
   * @param email - 邮箱地址
   * @returns 用户对象或null
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE email = ? AND status = 1').get(email) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  /**
   * 根据ID查找用户
   * 只返回状态正常的用户
   * @param id - 用户ID
   * @returns 用户对象或null
   */
  static async findById(id: number): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE id = ? AND status = 1').get(id) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  /**
   * 更新用户登录信息
   * @param id - 用户ID
   * @param ip - 登录IP
   */
  static async updateLoginInfo(id: number, ip: string): Promise<void> {
    try {
      const stmt = db.prepare(`
        UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP,
            last_login_ip = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(ip, id);
    } catch (error: any) {
      throw new Error(`更新登录信息失败: ${error.message}`);
    }
  }

  /**
   * 更新用户资料
   * @param id - 用户ID
   * @param profile - 要更新的资料字段
   */
  static async updateProfile(id: number, profile: Partial<User>): Promise<void> {
    try {
      const allowedFields = ['nickname', 'avatar', 'email'];
      const updates = Object.entries(profile)
        .filter(([key]) => allowedFields.includes(key))
        .map(([key, value]) => `${key} = ?`);

      if (updates.length === 0) return;

      const sql = `
        UPDATE users 
        SET ${updates.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const values = [
        ...Object.entries(profile)
          .filter(([key]) => allowedFields.includes(key))
          .map(([_, value]) => value),
        id,
      ];

      db.prepare(sql).run(...values);
    } catch (error: any) {
      throw new Error(`更新用户信息失败: ${error.message}`);
    }
  }

  /**
   * 验证用户密码
   * @param user - 用户对象
   * @param password - 待验证的密码
   * @returns 密码是否正确
   */
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_salt) return false;
    return CryptoUtil.verifyPassword(password, user.password_salt, user.password);
  }

  /**
   * 修改用户密码
   * @param id - 用户ID
   * @param oldPassword - 旧密码
   * @param newPassword - 新密码
   * @returns 是否修改成功
   */
  static async changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.findById(id);
      if (!user) throw new Error('用户不存在');

      const isValid = await this.verifyPassword(user, oldPassword);
      if (!isValid) throw new Error('原密码错误');

      const salt = CryptoUtil.generateSalt();
      const hashedPassword = CryptoUtil.hashPassword(newPassword, salt);

      const stmt = db.prepare(`
        UPDATE users 
        SET password = ?,
            password_salt = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(hashedPassword, salt, id);

      return true;
    } catch (error: any) {
      throw new Error(`修改密码失败: ${error.message}`);
    }
  }

  /**
   * 将用户对象转换为安全的用户对象
   * 移除敏感信息后返回
   * @param user - 原始用户对象
   * @returns 安全的用户对象
   */
  static toSafeUser(user: User): SafeUser {
    return {
      id: user.id!,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
    };
  }
}
