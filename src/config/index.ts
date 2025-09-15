// JWT配置
export const jwtConfig = {
  access: {
    name: 'access',
    secret: process.env.JWT_ACCESS_SECRET!,
    exp: process.env.JWT_ACCESS_EXPIRES || '1h',
  },
  refresh: {
    name: 'refresh',
    secret: process.env.JWT_REFRESH_SECRET!,
    exp: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
};

// 数据库连接配置
export const dbConfig = {
  adapter: 'mysql' as const,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT as string) || 3306,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

export const regexPatterns = {
  // 昵称正则：2-16位，允许中文、字母、数字和下划线
  nicknameRegex: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/,
  // 邮箱正则：邮箱格式
  emailRegex: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
  // 用户名正则：4-16位，只能包含字母、数字和下划线，且不能以数字开头
  usernameRegex: /^[a-zA-Z_][a-zA-Z0-9_]{3,16}$/,
  // 密码正则：6-20位，包含大小写字母、数字和基本特殊字符
  passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&\.]).{6,20}$/,
  // 密码正则1：6-20位，允许大小写字母、数字和基本特殊字符
  passwordRegex1: /^[a-zA-Z0-9_!@#$%&\.]{6,20}$/,
};
