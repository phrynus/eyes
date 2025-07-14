import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

import { config } from '@_text/config';
import { apiRoutes } from '@_text/routes/api';
import { wsRoutes } from '@_text/routes/ws';

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: '用户管理系统API',
          version: '1.0.0',
          description: '基于RBAC的用户管理系统API文档',
        },
      },
    })
  )
  .group('/api', (app) => app.use(apiRoutes))
  .group('/ws', (app) => app.use(wsRoutes))
  .listen(config.port);

console.log(`🚀 服务器已启动在 http://localhost:${config.port}`);

export type App = typeof app;
