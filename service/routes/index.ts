import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { staticPlugin } from '@elysiajs/static';
import { serverTiming } from '@elysiajs/server-timing';

//
import apiRoutes from './api';
import adminRoutes from './admin';
import { errorHandler } from '~/middlewares/error-handler.middleware';
//

export const app = new Elysia()
  .use(errorHandler()) // 添加全局错误处理中间件（必须在最前面）
  .use(
    openapi({
      documentation: {
        info: {
          title: 'RBAC 权限管理系统 API',
          version: '1.0.0',
          description: '基于角色的访问控制系统 API 文档',
        },
        tags: [
          { name: '认证', description: '用户认证相关接口' },
          { name: '用户', description: '用户个人信息管理' },
          { name: '管理员-认证', description: '管理员认证' },
          { name: '管理员-用户管理', description: '管理员用户管理' },
          { name: '管理员-应用管理', description: '管理员应用管理' },
          { name: '管理员-角色管理', description: '管理员角色管理' },
          { name: '管理员-权限管理', description: '管理员权限管理' },
          { name: '管理员-用户权限管理', description: '管理员用户权限分配' },
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'JWT Token 认证',
            },
          },
        },
      },
    })
  ) // 添加 Swagger 文档支持
  .use(cors()) // 添加CORS支持
  .use(serverTiming()) // 添加计时支持
  .use(
    staticPlugin({
      assets: './web/dist',
      prefix: '/',
      indexHTML: true,
      headers: {
        'Cache-Control': 'max-age=31536000', // 缓存一年
      },
    })
  )
  .use(apiRoutes) // 添加普通用户API路由
  .use(adminRoutes); // 添加管理员API路由
