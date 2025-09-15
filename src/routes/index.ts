import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { serverTiming } from '@elysiajs/server-timing';

export const app = new Elysia()
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
  ); // 添加静态文件支持
