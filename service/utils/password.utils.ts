export const passwordUtils = {
  // 哈希密码
  async hash(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: 'argon2id',
    });
  },

  // 验证密码
  async verify(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  },
};
