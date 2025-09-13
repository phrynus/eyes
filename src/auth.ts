import { jwt } from '@elysiajs/jwt';
import { userDb } from './database';

// JWT配置
export const jwtConfig = {
  access: {
    name: 'access',
    secret: process.env.JWT_ACCESS_SECRET!,
    exp: process.env.JWT_ACCESS_EXPIRES || '1h'
  },
  refresh: {
    name: 'refresh', 
    secret: process.env.JWT_REFRESH_SECRET!,
    exp: process.env.JWT_REFRESH_EXPIRES || '7d'
  }
};

// 密码哈希工具
export const passwordUtils = {
  // 哈希密码
  async hash(password: string): Promise<string> {
    return await Bun.password.hash(password);
  },

  // 验证密码
  async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }
};

// JWT令牌工具
export const tokenUtils = {
  // 生成访问令牌
  generateAccessToken(payload: any, jwt: any) {
    return jwt.sign({
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_ACCESS_EXPIRES || '3600')
    });
  },

  // 生成刷新令牌
  generateRefreshToken(payload: any, jwt: any) {
    return jwt.sign({
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_REFRESH_EXPIRES || '604800')
    });
  },

  // 验证令牌
  async verifyToken(token: string, jwt: any) {
    try {
      return await jwt.verify(token);
    } catch (error) {
      return null;
    }
  }
};

// 认证中间件
export const authMiddleware = async (context: any) => {
  const authorization = context.headers.authorization;
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    context.set.status = 401;
    return { error: '未提供认证令牌' };
  }

  const token = authorization.slice(7);
  const payload = await tokenUtils.verifyToken(token, context.jwt);

  if (!payload || payload.type !== 'access') {
    context.set.status = 401;
    return { error: '无效的访问令牌' };
  }

  // 验证用户是否仍然存在且活跃
  const user = await userDb.findById(payload.userId);
  if (!user) {
    context.set.status = 401;
    return { error: '用户不存在或已被禁用' };
  }

  // 将用户信息添加到上下文
  context.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname
  };

  return true;
};

// 用户认证服务
export const authService = {
  // 用户注册
  async register(data: {
    username: string;
    password: string;
    email?: string;
    nickname?: string;
  }) {
    // 检查用户名是否已存在
    const existingUser = await userDb.findByUsername(data.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (data.email) {
      const existingEmail = await userDb.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }
    }

    // 哈希密码
    const passwordHash = await passwordUtils.hash(data.password);

    // 创建用户
    const user = await userDb.create({
      username: data.username,
      password_hash: passwordHash,
      email: data.email,
      nickname: data.nickname || data.username
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      created_at: user.created_at
    };
  },

  // 用户登录
  async login(username: string, password: string, jwt: any) {
    // 查找用户
    const user = await userDb.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await passwordUtils.verify(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    // 更新最后登录时间
    await userDb.updateLastLogin(user.id);

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      username: user.username
    };

    const accessToken = tokenUtils.generateAccessToken(tokenPayload, jwt);
    const refreshToken = tokenUtils.generateRefreshToken(tokenPayload, jwt);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        last_login_at: new Date()
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(process.env.JWT_ACCESS_EXPIRES || '3600')
      }
    };
  },

  // 刷新令牌
  async refreshToken(refreshToken: string, jwt: any) {
    const payload = await tokenUtils.verifyToken(refreshToken, jwt);
    
    if (!payload || payload.type !== 'refresh') {
      throw new Error('无效的刷新令牌');
    }

    // 验证用户是否仍然存在
    const user = await userDb.findById(payload.userId);
    if (!user) {
      throw new Error('用户不存在或已被禁用');
    }

    // 生成新的访问令牌
    const tokenPayload = {
      userId: user.id,
      username: user.username
    };

    const newAccessToken = tokenUtils.generateAccessToken(tokenPayload, jwt);

    return {
      access_token: newAccessToken,
      expires_in: parseInt(process.env.JWT_ACCESS_EXPIRES || '3600')
    };
  }
};