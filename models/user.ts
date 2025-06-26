import { db } from './db';
import { CryptoUtil } from '../utils/crypto';

export interface User {
  id?: number;
  username: string;
  password: string;
  password_salt?: string;
  email?: string;
  created_at?: string;
}

export interface SafeUser {
  id: number;
  username: string;
  email?: string;
  created_at?: string;
  [key: string]: string | number | undefined;
}

export class UserModel {
  static async create(user: User): Promise<number> {
    try {
      const salt = CryptoUtil.generateSalt();
      const hashedPassword = CryptoUtil.hashPassword(user.password, salt);

      const stmt = db.prepare(
        'INSERT INTO users (username, password, password_salt, email) VALUES (?, ?, ?, ?)'
      );
      const result = stmt.run(user.username, hashedPassword, salt, user.email || null);
      return Number(result.lastInsertRowid);
    } catch (error: any) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }

  static async findByUsername(username: string): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | null;
    } catch (error: any) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_salt) return false;
    return CryptoUtil.verifyPassword(password, user.password_salt, user.password);
  }

  static toSafeUser(user: User): SafeUser {
    return {
      id: user.id!,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };
  }
} 