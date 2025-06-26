import { Elysia, t } from 'elysia';
import { UserModel } from '../models/user';
import { RefreshTokenModel } from '../models/refresh-token';
import type { User, SafeUser } from '../models/user';
import { authMiddleware } from '../middleware/auth.middleware';
import { authConfig } from '../config/auth.config';

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
        email: t.Optional(t.String()),
        nickname: t.Optional(t.String())
      })
    }
  )
  .post('/login', 
    async ({ body, request, ...ctx }) => {
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

      // 更新登录信息
      await UserModel.updateLoginInfo(user.id!, request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '');

      // 生成令牌
      const safeUser = UserModel.toSafeUser(user);
      const accessToken = await signAccessToken(safeUser);
      
      // 生成刷新令牌
      const refreshTokenPayload = { id: user.id, type: 'refresh' };
      const refreshToken = await signRefreshToken(refreshTokenPayload);
      
      // 保存刷新令牌
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期
      await RefreshTokenModel.create(user.id!, refreshToken, expiresAt);

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

      try {
        // 验证刷新令牌
        const payload = await verifyRefreshToken(refreshToken);
        if (!payload || !payload.id || payload.type !== 'refresh') {
          throw new Error('无效的刷新令牌');
        }

        // 检查数据库中的刷新令牌
        const tokenRecord = await RefreshTokenModel.findByToken(refreshToken);
        if (!tokenRecord) {
          throw new Error('刷新令牌已失效');
        }

        // 查找用户
        const user = await UserModel.findById(payload.id);
        if (!user) {
          throw new Error('用户不存在');
        }

        // 生成新的访问令牌
        const safeUser = UserModel.toSafeUser(user);
        const accessToken = await signAccessToken(safeUser);

        // 删除旧的刷新令牌
        await RefreshTokenModel.deleteByToken(refreshToken);

        // 生成新的刷新令牌
        const { signRefreshToken } = ctx as unknown as AuthContext;
        const newRefreshToken = await signRefreshToken({ id: user.id, type: 'refresh' });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshTokenModel.create(user.id!, newRefreshToken, expiresAt);

        return {
          success: true,
          accessToken,
          refreshToken: newRefreshToken
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message
        };
      }
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

      try {
        const payload = await verifyAccessToken(token);
        if (!payload || !payload.id) {
          throw new Error('无效的访问令牌');
        }

        const user = await UserModel.findById(payload.id);
        if (!user) {
          throw new Error('用户不存在');
        }

        return {
          success: true,
          user: UserModel.toSafeUser(user)
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message
        };
      }
    }
  )
  // 修改密码
  .post('/change-password',
    async ({ headers, body, ...ctx }) => {
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

      try {
        const payload = await verifyAccessToken(token);
        if (!payload || !payload.id) {
          throw new Error('无效的访问令牌');
        }

        const { oldPassword, newPassword } = body as { oldPassword: string; newPassword: string };
        await UserModel.changePassword(payload.id, oldPassword, newPassword);

        // 删除所有刷新令牌，强制用户重新登录
        await RefreshTokenModel.deleteByUserId(payload.id);

        return {
          success: true,
          message: '密码修改成功，请重新登录'
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
        oldPassword: t.String(),
        newPassword: t.String()
      })
    }
  )
  // 更新用户资料
  .put('/profile',
    async ({ headers, body, ...ctx }) => {
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

      try {
        const payload = await verifyAccessToken(token);
        if (!payload || !payload.id) {
          throw new Error('无效的访问令牌');
        }

        await UserModel.updateProfile(payload.id, body as Partial<User>);
        const user = await UserModel.findById(payload.id);

        return {
          success: true,
          message: '资料更新成功',
          user: UserModel.toSafeUser(user!)
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
        nickname: t.Optional(t.String()),
        avatar: t.Optional(t.String()),
        email: t.Optional(t.String())
      })
    }
  )
  // 登出
  .post('/logout',
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

      try {
        const payload = await verifyAccessToken(token);
        if (!payload || !payload.id) {
          throw new Error('无效的访问令牌');
        }

        // 删除用户的所有刷新令牌
        await RefreshTokenModel.deleteByUserId(payload.id);

        return {
          success: true,
          message: '登出成功'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message
        };
      }
    }
  ); 