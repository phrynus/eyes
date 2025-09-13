import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { serverTiming } from '@elysiajs/server-timing';
import { testConnection } from './database';
import { authRoutes } from './routes/auth';

// 测试数据库连接
await testConnection();

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: '用户认证系统 API',
          version: '1.0.0',
          description: '基于 Elysia 和 Bun.SQL 的用户认证系统',
        },
        tags: [{ name: '认证', description: '用户认证相关接口' }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    })
  ) // 添加OpenAPI支持
  .use(cors()) // 添加CORS支持
  .use(serverTiming()) // 添加计时支持
  .use(
    staticPlugin({
      assets: './public',
      headers: {
        'Cache-Control': 'max-age=31536000', // 缓存一年
      },
    })
  ) // 添加静态文件支持
  .use(authRoutes) // 注册认证路由
  .listen(process.env.PORT || 3000);

console.log(`API文档: http://localhost:${app.server?.port}/openapi`);
