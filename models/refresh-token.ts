import { db } from './db';

/**
 * 刷新令牌接口定义
 */
export interface RefreshToken {
  id?: number;            // 令牌ID
  user_id: number;        // 用户ID
  token: string;          // 令牌值
  expires_at: string;     // 过期时间
  created_at?: string;    // 创建时间
}

/**
 * 刷新令牌模型
 * 处理刷新令牌的创建、查询、删除等操作
 */
export class RefreshTokenModel {
  /**
   * 创建新的刷新令牌
   * @param userId - 用户ID
   * @param token - 令牌值
   * @param expiresAt - 过期时间
   */
  static async create(userId: number, token: string, expiresAt: Date): Promise<void> {
    try {
      const stmt = db.prepare(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `);
      stmt.run(userId, token, expiresAt.toISOString());
    } catch (error: any) {
      throw new Error(`创建刷新令牌失败: ${error.message}`);
    }
  }

  /**
   * 根据令牌值查找未过期的刷新令牌
   * @param token - 令牌值
   * @returns 刷新令牌对象或null
   */
  static async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      return db.prepare(`
        SELECT * FROM refresh_tokens 
        WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
      `).get(token) as RefreshToken | null;
    } catch (error: any) {
      throw new Error(`查找刷新令牌失败: ${error.message}`);
    }
  }

  /**
   * 删除指定的刷新令牌
   * @param token - 要删除的令牌值
   */
  static async deleteByToken(token: string): Promise<void> {
    try {
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
    } catch (error: any) {
      throw new Error(`删除刷新令牌失败: ${error.message}`);
    }
  }

  /**
   * 删除用户的所有刷新令牌
   * 用于用户登出或密码修改时
   * @param userId - 用户ID
   */
  static async deleteByUserId(userId: number): Promise<void> {
    try {
      db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
    } catch (error: any) {
      throw new Error(`删除用户刷新令牌失败: ${error.message}`);
    }
  }

  /**
   * 清理所有过期的刷新令牌
   * 可以定期调用此方法进行清理
   */
  static async cleanExpired(): Promise<void> {
    try {
      db.prepare('DELETE FROM refresh_tokens WHERE expires_at <= CURRENT_TIMESTAMP').run();
    } catch (error: any) {
      throw new Error(`清理过期刷新令牌失败: ${error.message}`);
    }
  }
} 