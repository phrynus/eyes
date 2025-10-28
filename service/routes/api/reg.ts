import { Elysia, t } from 'elysia';
import { regexPatterns } from '~/config';
import { success, err } from '~/utils/response.utils';

export default new Elysia({ prefix: '/reg' }).post('/', async ({ body }) => {
  try {
    const { username, password } = body as { username: string; password: string };

    // 验证用户名
    if (!username || !regexPatterns.usernameRegex.test(username)) {
      err(400);
    }

    // 验证密码
    if (!password || !regexPatterns.passwordRegex.test(username)) {
      err(400);
    }

    return success(body, '用户注册成功');
  } catch (error) {
    throw error;
  }
});
