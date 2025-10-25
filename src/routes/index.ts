import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { serverTiming } from '@elysiajs/server-timing';

//
import apiRoutes from './api';
import { errorHandler } from '@/middlewares/error-handler.middleware';
//

export const app = new Elysia()
  .use(errorHandler()) // 添加全局错误处理中间件（必须在最前面）
  .use(openapi()) // 添加OpenAPI支持
  .use(cors()) // 添加CORS支持
  .use(serverTiming()) // 添加计时支持
  .use(
    staticPlugin({
      assets: './public',
      headers: {
        'Cache-Control': 'max-age=31536000', // 缓存一年
      },
    })
  )
  .use(apiRoutes); // 添加API路由
