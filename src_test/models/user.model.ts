import { getDatabase } from '@_text/database';
import { User } from '@_text/types';
import * as argon2 from 'argon2';

export class UserModel {
  static async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // 密码加密
    const hashedPassword = await argon2.hash(user.password);

    const result = db.run(
      `INSERT INTO users (username, password, nickname, avatar, email, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.username, hashedPassword, user.nickname || null, user.avatar || null, user.email || null, user.phone || null, now, now]
    );

    return {
      id: result.lastInsertId as number,
      ...user,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async findById(id: number): Promise<User | null> {
    const db = await getDatabase();
    const user = db
      .query(
        `SELECT id, username, password, nickname, avatar, email, phone, created_at as createdAt, updated_at as updatedAt 
       FROM users WHERE id = ?`
      )
      .get(id) as User | null;

    return user;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const db = await getDatabase();
    const user = db
      .query(
        `SELECT id, username, password, nickname, avatar, email, phone, created_at as createdAt, updated_at as updatedAt 
       FROM users WHERE username = ?`
      )
      .get(username) as User | null;

    return user;
  }

  static async update(id: number, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // 如果要更新密码，需要加密
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    // 构建更新语句
    const fields = Object.keys(data).map((key) => `${key === 'createdAt' ? 'created_at' : key === 'updatedAt' ? 'updated_at' : key} = ?`);
    const values = Object.values(data);

    if (fields.length === 0) {
      return false;
    }

    const result = db.run(`UPDATE users SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`, [...values, now, id]);

    return result.changes > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await argon2.verify(user.password, password);
  }

  static async list(page: number = 1, limit: number = 10): Promise<User[]> {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    const users = db
      .query(
        `SELECT id, username, password, nickname, avatar, email, phone, created_at as createdAt, updated_at as updatedAt 
       FROM users LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as User[];

    return users;
  }

  static async count(): Promise<number> {
    const db = await getDatabase();
    const result = db.query('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return result.count;
  }
}
