export const authConfig = {
  jwt: {
    secret: 'your-secret-key-here', // 在生产环境中应该使用环境变量
    accessToken: {
      expires: '15m',  // 访问令牌 15 分钟过期
      secret: 'access-token-secret'  // 应该使用环境变量
    },
    refreshToken: {
      expires: '7d',   // 刷新令牌 7 天过期
      secret: 'refresh-token-secret' // 应该使用环境变量
    }
  },
  password: {
    saltLength: 16  // 密码加盐长度
  }
}; 