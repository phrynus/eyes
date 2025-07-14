import { config } from '@_text/config';

export interface AdminAuthPayload {
  sub: string; // 固定为 'admin'
  username: string; // 固定为 'admin'
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}

export interface AdminLoginResult {
  username: string;
  accessToken: string;
  expires: string;
}

export class AdminAuthService {
  /**
   * 管理员登录
   * @param username 用户名（必须为admin）
   * @param password 密码
   * @param jwtSign JWT签名函数
   * @returns 登录结果或null（登录失败）
   */
  static async login(username: string, password: string, jwtSign: (payload: any) => Promise<string>): Promise<AdminLoginResult | null> {
    // 验证用户名必须是admin
    if (username !== config.admin.username) {
      return null;
    }

    // 验证密码
    if (password !== config.admin.password) {
      return null;
    }

    // 生成管理员令牌
    const payload: AdminAuthPayload = {
      sub: 'admin',
      username: config.admin.username,
    };

    const accessToken = await jwtSign(payload);

    // 计算过期时间
    const expiresDate = new Date();
    expiresDate.setSeconds(expiresDate.getSeconds() + config.admin.jwtExpires);

    return {
      username: config.admin.username,
      accessToken,
      expires: expiresDate.toISOString(),
    };
  }

  /**
   * 管理员令牌续期
   * @param token 当前有效的令牌
   * @param jwtSign JWT签名函数
   * @param jwtVerify JWT验证函数
   * @returns 新的令牌信息或null（令牌无效）
   */
  static async refreshToken(token: string, jwtSign: (payload: any) => Promise<string>, jwtVerify: (token: string) => Promise<any>): Promise<{ accessToken: string; expires: string } | null> {
    try {
      // 验证当前令牌
      const payload = (await jwtVerify(token)) as AdminAuthPayload | null;

      if (!payload || payload.sub !== 'admin' || payload.username !== config.admin.username) {
        return null;
      }

      // 生成新的管理员令牌
      const newPayload: AdminAuthPayload = {
        sub: 'admin',
        username: config.admin.username,
        iat: payload.iat,
        exp: payload.exp,
      };

      const accessToken = await jwtSign(newPayload);

      // 计算过期时间
      const expiresDate = new Date();
      expiresDate.setSeconds(expiresDate.getSeconds() + config.admin.jwtExpires);

      return {
        accessToken,
        expires: expiresDate.toISOString(),
      };
    } catch (error) {
      console.error('管理员令牌续期失败:', error);
      return null;
    }
  }

  /**
   * 验证管理员令牌
   * @param token JWT令牌
   * @param jwtVerify JWT验证函数
   * @returns 验证结果
   */
  static async verifyToken(token: string, jwtVerify: (token: string) => Promise<any>): Promise<{ valid: boolean; payload?: AdminAuthPayload }> {
    try {
      const payload = (await jwtVerify(token)) as AdminAuthPayload;

      if (!payload || payload.sub !== 'admin' || payload.username !== config.admin.username) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }
}
