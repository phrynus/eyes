import { SQL } from 'bun';

// 数据库连接配置
const dbConfig = {
  adapter: 'mysql' as const,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT as string) || 3306,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

// 创建数据库连接
export const db = new SQL(dbConfig);

// 测试数据库连接
export async function testConnection() {
  try {
    const result = await db`SELECT 1 as test`;
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 用户相关数据库操作
export const userDb = {
  // 根据用户名查找用户
  async findByUsername(username: string) {
    const [user] = await db`
      SELECT * FROM users 
      WHERE username = ${username} AND status = 1
    `;
    return user;
  },

  // 根据邮箱查找用户
  async findByEmail(email: string) {
    const [user] = await db`
      SELECT * FROM users 
      WHERE email = ${email} AND status = 1
    `;
    return user;
  },

  // 根据ID查找用户
  async findById(id: number) {
    const [user] = await db`
      SELECT * FROM users 
      WHERE id = ${id} AND status = 1
    `;
    return user;
  },

  // 创建新用户
  async create(userData: { username: string; password_hash: string; email?: string; nickname?: string }) {
    const [user] = await db`
      INSERT INTO users ${db(userData)}
      RETURNING *
    `;
    return user;
  },

  // 更新最后登录时间
  async updateLastLogin(id: number) {
    await db`
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  },

  // 更新用户信息
  async update(id: number, updateData: Record<string, any>) {
    const [user] = await db`
      UPDATE users 
      SET ${db(updateData)}
      WHERE id = ${id}
      RETURNING *
    `;
    return user;
  },
};
