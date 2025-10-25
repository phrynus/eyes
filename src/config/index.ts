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

export const regexPatterns = {
  // 昵称正则：2-16位，允许中文、字母、数字下划线
  nicknameRegex: /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/,
  // 邮箱正则：邮箱格式
  emailRegex: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
  // 用户正则：4-16位，只能包含字母、数字和下划线，且不能以数字开头
  usernameRegex: /^[a-zA-Z_][a-zA-Z0-9_]{4,16}$/,
  // 密码正则：6-24位，允许大小写字母、数字和基本特殊字符
  passwordRegex: /^[a-zA-Z0-9_!@#$%&\.]{6,24}$/,
};
