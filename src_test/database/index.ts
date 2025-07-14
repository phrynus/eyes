import { Database } from 'bun:sqlite';
import { config } from '@_text/config';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// 确保数据库目录存在
async function ensureDirExists(filePath: string) {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err;
    }
  }
}

// 初始化数据库
async function initializeDatabase() {
  await ensureDirExists(config.db.path);

  const db = new Database(config.db.path);

  // 用户表：存储系统用户的基本信息
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 用户ID，自增主键
      username TEXT UNIQUE NOT NULL,           -- 用户名，唯一标识
      password TEXT NOT NULL,                  -- 用户密码，加密存储
      nickname TEXT,                           -- 用户昵称
      avatar TEXT,                             -- 用户头像URL
      email TEXT,                              -- 用户邮箱
      phone TEXT,                              -- 用户手机号
      created_at TEXT NOT NULL,                -- 创建时间
      updated_at TEXT NOT NULL                 -- 更新时间
    )
  `);

  // 角色表：定义系统中的角色类型
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 角色ID，自增主键
      name TEXT NOT NULL,                      -- 角色名称，如"管理员"、"普通用户"
      code TEXT UNIQUE NOT NULL,               -- 角色编码，唯一标识，如"admin"、"user"
      description TEXT,                        -- 角色描述
      created_at TEXT NOT NULL,                -- 创建时间
      updated_at TEXT NOT NULL                 -- 更新时间
    )
  `);

  // 权限表：定义系统中的权限项
  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 权限ID，自增主键
      name TEXT NOT NULL,                      -- 权限名称，如"创建用户"、"删除文章"
      code TEXT UNIQUE NOT NULL,               -- 权限编码，唯一标识，如"user:create"、"article:delete"
      description TEXT,                        -- 权限描述
      created_at TEXT NOT NULL,                -- 创建时间
      updated_at TEXT NOT NULL                 -- 更新时间
    )
  `);

  // 用户-角色关联表：实现用户和角色的多对多关系
  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL,                -- 用户ID，外键关联users表
      role_id INTEGER NOT NULL,                -- 角色ID，外键关联roles表
      PRIMARY KEY (user_id, role_id),          -- 联合主键，确保用户-角色关系唯一
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,    -- 用户删除时级联删除关联关系
      FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE     -- 角色删除时级联删除关联关系
    )
  `);

  // 角色-权限关联表：实现角色和权限的多对多关系
  db.run(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL,                -- 角色ID，外键关联roles表
      permission_id INTEGER NOT NULL,          -- 权限ID，外键关联permissions表
      PRIMARY KEY (role_id, permission_id),    -- 联合主键，确保角色-权限关系唯一
      FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,           -- 角色删除时级联删除关联关系
      FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE -- 权限删除时级联删除关联关系
    )
  `);

  // 用户-额外权限关联表：用于给用户分配额外的特殊权限
  db.run(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      user_id INTEGER NOT NULL,                -- 用户ID，外键关联users表
      permission_id INTEGER NOT NULL,          -- 权限ID，外键关联permissions表
      PRIMARY KEY (user_id, permission_id),    -- 联合主键，确保用户-权限关系唯一
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,           -- 用户删除时级联删除关联关系
      FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE -- 权限删除时级联删除关联关系
    )
  `);

  return db;
}

// 导出数据库实例
let db: Database;

export async function getDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

// 初始化数据库
getDatabase().catch(console.error);
