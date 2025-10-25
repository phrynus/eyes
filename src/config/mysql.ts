import { SQL } from 'bun';

// 创建数据库连接
export const mysql = new SQL({
  adapter: 'mysql', // 使用 MySQL
  //
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT as string) || 3306,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  //
  ssl: false, // 禁用 SSL
  max: 20, // 最大并发连接数20
  idleTimeout: 30, // 30秒后关闭空闲连接
  maxLifetime: 3600, // 最大连接生存期 1 小时
  connectionTimeout: 10, // 连接超时时间 10秒
} as SQL.Options);
try {
  await mysql.connect();
  console.log('数据库连接成功');
} catch (error) {
  console.error('Error connecting to MySQL:', error);
}
