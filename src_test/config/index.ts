interface Config {
  port: number;
  db: {
    path: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpires: number; // 单位：秒
    refreshExpires: number; // 单位：秒
  };
  admin: {
    username: string;
    password: string;
    jwtSecret: string;
    jwtExpires: number; // 单位：秒
  };
}

export const config: Config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    path: process.env.DB_PATH || 'data/sqlite.db',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    accessExpires: Number(process.env.JWT_ACCESS_EXPIRES) || 3600, // 默认1小时
    refreshExpires: Number(process.env.JWT_REFRESH_EXPIRES) || 604800, // 默认7天
  },
  admin: {
    username: 'admin', // 固定管理员用户名
    password: process.env.ADMIN_PASSWORD || 'admin123',
    jwtSecret: process.env.ADMIN_JWT_SECRET || 'admin_secret_key',
    jwtExpires: Number(process.env.ADMIN_JWT_EXPIRES) || 86400, // 默认24小时
  },
};
