import { SQL } from 'bun';
import { dbConfig } from '@/config';

// 创建数据库连接
export const db = new SQL(dbConfig);

// 测试数据库连接
export async function testConnection() {
  try {
    await db`SELECT 1`;
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}