<<<<<<< HEAD
import { Database } from 'bun:sqlite';

/**
 * 数据库连接实例
 * 使用 SQLite 数据库，文件存储在 data/mydb.sqlite
 */
const db = new Database('data/mydb.sqlite');

/**
 * 用户表结构
 * - id: 自增主键
 * - username: 用户名（唯一）
 * - password: 加密后的密码
 * - password_salt: 密码加盐
 * - email: 邮箱（唯一，可选）
 * - nickname: 昵称（可选）
 * - avatar: 头像URL（可选）
 * - status: 用户状态（1: 正常, 0: 禁用）
 * - last_login_at: 最后登录时间
 * - last_login_ip: 最后登录IP
 * - created_at: 创建时间
 * - updated_at: 更新时间
 */
=======
import { Database } from "bun:sqlite";

const db = new Database("data/mydb.sqlite");

// 创建用户表
>>>>>>> 0fd4890d18a1b5b168750f29792b8d2d2db3385f
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    email TEXT UNIQUE,
<<<<<<< HEAD
    nickname TEXT,
    avatar TEXT,
    status INTEGER DEFAULT 1,
    last_login_at DATETIME,
    last_login_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * 刷新令牌表结构
 * - id: 自增主键
 * - user_id: 用户ID（外键关联users表）
 * - token: 刷新令牌
 * - expires_at: 过期时间
 * - created_at: 创建时间
 *
 * 说明：
 * 1. 使用外键约束确保用户删除时自动删除相关令牌
 * 2. expires_at 用于自动判断令牌是否过期
 */
db.run(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

/**
 * 创建必要的索引
 * 1. 邮箱索引：用于邮箱查询
 * 2. 用户状态索引：用于状态过滤
 * 3. 刷新令牌用户ID索引：用于查询用户的所有令牌
 * 4. 刷新令牌索引：用于令牌查询
 */
db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
db.run('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');
db.run('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)');

export { db };
=======
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export { db }; 
>>>>>>> 0fd4890d18a1b5b168750f29792b8d2d2db3385f
