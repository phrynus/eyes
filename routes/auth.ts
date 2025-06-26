import { Elysia, t } from 'elysia';
import { UserModel } from '../models/user';
import type { User, SafeUser } from '../models/user';
import { authMiddleware } from '../middleware/auth.middleware';

type AuthContext = {
  signAccessToken: (payload: any) => Promise<string>;
  signRefreshToken: (payload: any) => Promise<string>;
  verifyAccessToken: (token: string) => Promise<any>;
  verifyRefreshToken: (token: string) => Promise<any>;
};

export const auth = new Elysia({ prefix: '/auth' })
  .use(authMiddleware)
  .post('/register', 
    async ({ body }) => {
      const userData = body as User;
      
      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: '用户名已存在'
        };
      }

      // 检查邮箱是否已存在
      if (userData.email) {
        const existingEmail = await UserModel.findByEmail(userData.email);
        if (existingEmail) {
          return {
            success: false,
            message: '邮箱已被使用'
          };
        }
      }

      // 创建用户
      try {
        const userId = await UserModel.create(userData);
        return {
          success: true,
          message: '注册成功',
          userId
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
        email: t.Optional(t.String())
      })
    }
  )
  .post('/login', 
    async ({ body, ...ctx }) => {
      const { username, password } = body as User;
      const { signAccessToken, signRefreshToken } = ctx as unknown as AuthContext;
      
      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证密码
      const isValidPassword = await UserModel.verifyPassword(user, password);
      if (!isValidPassword) {
        return {
          success: false,
          message: '密码错误'
        };
      }

      // 生成 token
      const safeUser = UserModel.toSafeUser(user);
      const accessToken = await signAccessToken(safeUser);
      const refreshToken = await signRefreshToken({ id: user.id });

      return {
        success: true,
        message: '登录成功',
        user: safeUser,
        accessToken,
        refreshToken
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String()
      })
    }
  )
  // 刷新访问令牌
  .post('/refresh',
    async ({ headers, ...ctx }) => {
      const { signAccessToken, verifyRefreshToken } = ctx as unknown as AuthContext;
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          message: '未提供刷新令牌'
        };
      }

      const refreshToken = authHeader.split(' ')[1] || '';
      if (!refreshToken) {
        return {
          success: false,
          message: '未提供刷新令牌'
        };
      }

      const payload = await verifyRefreshToken(refreshToken);
      
      if (!payload || !payload.id) {
        return {
          success: false,
          message: '刷新令牌无效或已过期'
        };
      }

      // 查找用户
      const user = await UserModel.findById(payload.id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 生成新的访问令牌
      const safeUser = UserModel.toSafeUser(user);
      const accessToken = await signAccessToken(safeUser);

      return {
        success: true,
        accessToken
      };
    }
  )
  // 获取当前用户信息
  .get('/me', 
    async ({ headers, ...ctx }) => {
      const { verifyAccessToken } = ctx as unknown as AuthContext;
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          message: '未授权访问'
        };
      }

      const token = authHeader.split(' ')[1] || '';
      if (!token) {
        return {
          success: false,
          message: '未授权访问'
        };
      }

      const payload = await verifyAccessToken(token);
      
      if (!payload) {
        return {
          success: false,
          message: 'token无效或已过期'
        };
      }

      return {
        success: true,
        user: payload
      };
    }
  ); 