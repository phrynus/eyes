import { Database } from 'bun:sqlite';

/**
 * Redis键值类型定义
 */
type TypeRedisKeys = {
  key: string;
  type: string;
  value: string;
  expire: number | null;
};

/**
 * 设置缓存的参数类型
 */
type SetOptions = {
  key: string;
  value: string | object;
  expire?: number | string; // 支持时间戳、秒数、时间段格式（1D/1H/1M/1S）
  type?: 'string' | 'object';
};

const db = new Database(':memory:');
// 创建表
db.run(`CREATE TABLE IF NOT EXISTS redis_keys (key TEXT PRIMARY KEY,type TEXT NOT NULL,value TEXT NOT NULL,expire INTEGER,created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000))`);
// 创建索引以优化过期键查询
db.run(`CREATE INDEX IF NOT EXISTS idx_expire ON redis_keys(expire)`);

class Sqlite {
  private db: Database;
  private lastCleanTime: number;
  private readonly cleanInterval: number = 10000; // 清理间隔：10秒

  // 预编译的 SQL 语句
  private stmts!: {
    cleanExpired: ReturnType<Database['prepare']>;
    get: ReturnType<Database['prepare']>;
    set: ReturnType<Database['prepare']>;
    delete: ReturnType<Database['prepare']>;
    exists: ReturnType<Database['prepare']>;
    keys: ReturnType<Database['prepare']>;
    keysWithPattern: ReturnType<Database['prepare']>;
    ttl: ReturnType<Database['prepare']>;
    expire: ReturnType<Database['prepare']>;
    persist: ReturnType<Database['prepare']>;
    statsTotal: ReturnType<Database['prepare']>;
    statsExpired: ReturnType<Database['prepare']>;
    statsPermanent: ReturnType<Database['prepare']>;
    clear: ReturnType<Database['prepare']>;
    flushExpired: ReturnType<Database['prepare']>;
  };

  constructor() {
    this.db = db;
    this.lastCleanTime = Date.now();

    // 预编译所有 SQL 语句，提升性能
    this.stmts = {
      cleanExpired: this.db.prepare(`DELETE FROM redis_keys WHERE expire IS NOT NULL AND expire < ?`),
      get: this.db.prepare<TypeRedisKeys, [string]>(`SELECT * FROM redis_keys WHERE key = ?`),
      set: this.db.prepare(`INSERT OR REPLACE INTO redis_keys (key, type, value, expire) VALUES (?, ?, ?, ?)`),
      delete: this.db.prepare(`DELETE FROM redis_keys WHERE key = ?`),
      exists: this.db.prepare<{ count: number }, [string, number]>(`SELECT COUNT(*) as count FROM redis_keys WHERE key = ? AND (expire IS NULL OR expire > ?)`),
      keys: this.db.prepare<{ key: string }, [number]>(`SELECT key FROM redis_keys WHERE expire IS NULL OR expire > ?`),
      keysWithPattern: this.db.prepare<{ key: string }, [string, number]>(`SELECT key FROM redis_keys WHERE key LIKE ? AND (expire IS NULL OR expire > ?)`),
      ttl: this.db.prepare<TypeRedisKeys, [string]>(`SELECT expire FROM redis_keys WHERE key = ?`),
      expire: this.db.prepare(`UPDATE redis_keys SET expire = ? WHERE key = ?`),
      persist: this.db.prepare(`UPDATE redis_keys SET expire = NULL WHERE key = ?`),
      statsTotal: this.db.prepare<{ count: number }, []>(`SELECT COUNT(*) as count FROM redis_keys`),
      statsExpired: this.db.prepare<{ count: number }, [number]>(`SELECT COUNT(*) as count FROM redis_keys WHERE expire IS NOT NULL AND expire <= ?`),
      statsPermanent: this.db.prepare<{ count: number }, []>(`SELECT COUNT(*) as count FROM redis_keys WHERE expire IS NULL`),
      clear: this.db.prepare(`DELETE FROM redis_keys`),
      flushExpired: this.db.prepare(`DELETE FROM redis_keys WHERE expire IS NOT NULL AND expire < ?`),
    };
  }

  /**
   * 获取数据库实例
   */
  getDb(): Database {
    return this.db;
  }

  /**
   * 清理过期的缓存数据
   * 每隔 cleanInterval 时间执行一次
   */
  private async clean(): Promise<number> {
    try {
      const now = Date.now();
      if (now - this.lastCleanTime > this.cleanInterval) {
        this.lastCleanTime = now;
        const result = this.stmts.cleanExpired.run(now);
        return result.changes;
      }
      return 0;
    } catch (error) {
      console.error('清理缓存失败:', error);
      return 0;
    }
  }

  /**
   * 解析过期时间
   * @param expire - 支持时间戳、秒数、时间段格式（1D/1H/1M/1S/1W）
   * @returns 过期时间戳（毫秒）或 null
   */
  private parseExpireTime(expire?: number | string): number | null {
    if (expire === undefined || expire === null) {
      return null;
    }

    if (typeof expire === 'number') {
      // 如果是13位时间戳，直接使用；否则视为相对秒数
      return expire > 1000000000000 ? expire : Date.now() + expire * 1000;
    }

    if (typeof expire === 'string') {
      // 解析时间段格式：1D/1H/1M/1S/1W
      const match = expire.match(/^(\d+)([WDHMS])$/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toUpperCase();
        const multipliers: Record<string, number> = {
          S: 1000, // 秒
          M: 60 * 1000, // 分钟
          H: 60 * 60 * 1000, // 小时
          D: 24 * 60 * 60 * 1000, // 天
          W: 7 * 24 * 60 * 60 * 1000, // 周
        };
        return Date.now() + value * multipliers[unit];
      }
    }

    return null;
  }

  /**
   * 获取缓存数据
   * @param key - 键名
   * @returns 缓存值，如果是对象会自动解析
   */
  async get<T = any>(key: string): Promise<T | null> {
    this.clean();
    try {
      const result = this.stmts.get.get(key) as TypeRedisKeys | undefined;

      if (!result) {
        return null;
      }

      // 检查是否过期
      if (result.expire !== null && result.expire <= Date.now()) {
        // 删除过期键
        await this.del(key);
        return null;
      }

      // 根据类型返回数据
      if (result.type === 'object') {
        return JSON.parse(result.value) as T;
      }
      return result.value as T;
    } catch (error) {
      throw new Error(`获取缓存失败 [${key}]: ${error}`);
    }
  }

  /**
   * 批量获取缓存数据
   * @param keys - 键名数组
   * @returns 键值对对象
   */
  async getMany<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }
    return result;
  }

  /**
   * 设置缓存数据（支持新增和更新）
   * @param options - 设置选项
   * @returns 是否成功
   */
  async set(options: SetOptions): Promise<boolean> {
    this.clean();
    try {
      // 判断数据类型
      let valueStr: string;
      let dataType: string;

      if (typeof options.value === 'string') {
        valueStr = options.value;
        dataType = options.type || 'string';
      } else {
        valueStr = JSON.stringify(options.value);
        dataType = 'object';
      }

      // 解析过期时间
      const expireTime = this.parseExpireTime(options.expire);

      // 使用预编译语句
      const result = this.stmts.set.run(options.key, dataType, valueStr, expireTime);

      return result.changes > 0;
    } catch (error) {
      throw new Error(`设置缓存失败 [${options.key}]: ${error}`);
    }
  }

  /**
   * 批量设置缓存数据
   * @param items - 设置选项数组
   * @returns 成功设置的数量
   */
  async setMany(items: SetOptions[]): Promise<number> {
    let successCount = 0;
    for (const item of items) {
      if (await this.set(item)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 删除缓存数据
   * @param key - 键名
   * @returns 是否成功
   */
  async del(key: string): Promise<boolean> {
    this.clean();
    try {
      const result = this.stmts.delete.run(key);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`删除缓存失败 [${key}]: ${error}`);
    }
  }

  /**
   * 批量删除缓存数据
   * @param keys - 键名数组
   * @returns 删除的数量
   */
  async delMany(keys: string[]): Promise<number> {
    let deleteCount = 0;
    for (const key of keys) {
      if (await this.del(key)) {
        deleteCount++;
      }
    }
    return deleteCount;
  }

  /**
   * 检查键是否存在
   * @param key - 键名
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    this.clean();
    try {
      const result = this.stmts.exists.get(key, Date.now()) as { count: number } | undefined;
      return result ? result.count > 0 : false;
    } catch (error) {
      throw new Error(`检查键存在失败 [${key}]: ${error}`);
    }
  }

  /**
   * 获取所有键名
   * @param pattern - 可选的匹配模式（SQL LIKE 语法，如 'user:%'）
   * @returns 键名数组
   */
  async keys(pattern?: string): Promise<string[]> {
    this.clean();
    try {
      let result: { key: string }[];

      if (pattern) {
        result = this.stmts.keysWithPattern.all(pattern, Date.now()) as { key: string }[];
      } else {
        result = this.stmts.keys.all(Date.now()) as { key: string }[];
      }

      return result.map((row) => row.key);
    } catch (error) {
      throw new Error(`获取键列表失败: ${error}`);
    }
  }

  /**
   * 获取键的剩余过期时间（毫秒）
   * @param key - 键名
   * @returns 剩余时间（毫秒），-1表示永不过期，-2表示键不存在
   */
  async ttl(key: string): Promise<number> {
    try {
      const result = this.stmts.ttl.get(key) as TypeRedisKeys | undefined;

      if (!result) {
        return -2; // 键不存在
      }

      if (result.expire === null) {
        return -1; // 永不过期
      }

      const remaining = result.expire - Date.now();
      return remaining > 0 ? remaining : -2; // 已过期视为不存在
    } catch (error) {
      throw new Error(`获取过期时间失败 [${key}]: ${error}`);
    }
  }

  /**
   * 更新键的过期时间
   * @param key - 键名
   * @param expire - 过期时间
   * @returns 是否成功
   */
  async expire(key: string, expire: number | string): Promise<boolean> {
    try {
      const expireTime = this.parseExpireTime(expire);
      const result = this.stmts.expire.run(expireTime, key);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`更新过期时间失败 [${key}]: ${error}`);
    }
  }

  /**
   * 移除键的过期时间（设置为永不过期）
   * @param key - 键名
   * @returns 是否成功
   */
  async persist(key: string): Promise<boolean> {
    try {
      const result = this.stmts.persist.run(key);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`移除过期时间失败 [${key}]: ${error}`);
    }
  }

  /**
   * 获取缓存数据库的统计信息
   * @returns 统计信息对象
   */
  async stats(): Promise<{ total: number; expired: number; permanent: number }> {
    try {
      const totalResult = this.stmts.statsTotal.get() as { count: number } | undefined;
      const expiredResult = this.stmts.statsExpired.get(Date.now()) as { count: number } | undefined;
      const permanentResult = this.stmts.statsPermanent.get() as { count: number } | undefined;

      const total = totalResult?.count || 0;
      const expired = expiredResult?.count || 0;
      const permanent = permanentResult?.count || 0;

      return { total, expired, permanent };
    } catch (error) {
      throw new Error(`获取统计信息失败: ${error}`);
    }
  }

  /**
   * 清空所有缓存数据
   * @returns 清除的数量
   */
  async clear(): Promise<number> {
    try {
      const result = this.stmts.clear.run();
      return result.changes;
    } catch (error) {
      throw new Error(`清空缓存失败: ${error}`);
    }
  }

  /**
   * 立即执行过期键清理
   * @returns 清理的数量
   */
  async flushExpired(): Promise<number> {
    try {
      const result = this.stmts.flushExpired.run(Date.now());
      this.lastCleanTime = Date.now();
      return result.changes;
    } catch (error) {
      throw new Error(`清理过期缓存失败: ${error}`);
    }
  }
}
export const sqlite = new Sqlite();
export default { sqlite };
