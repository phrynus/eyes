import { Elysia } from 'elysia';
import { ResponseCode } from '@/utils/response.utils';

/**
 * 全局错误处理中间件
 */
export const errorHandler = () =>
  new Elysia({ name: 'error-handler' })
    .onError(({ code, error, set }) => {
      // 安全地获取错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('错误详情:', {
        code,
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
      });
    })
    .onBeforeHandle(({ request }) => {
      // 记录请求日志
      console.log(`${request.method} ${request.url} - ${new Date().toISOString()}`);
    });
