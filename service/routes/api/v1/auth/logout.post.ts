import { Elysia, t } from 'elysia';
import { success } from '~/utils/response.utils';

export default new Elysia().post(
  '/logout',
  () => {
    return success(null, '登出成功');
  },
  {
    detail: {
      tags: ['认证'],
      summary: '用户登出',
      description: '登出当前用户（客户端需删除 token）',
    },
    response: {
      200: t.Object({
        code: t.Number(),
        message: t.String(),
        data: t.Null(),
        timestamp: t.Number(),
      }),
    },
  }
);
