import { Elysia, type Context as BaseContext } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

import { staticAssets } from '@/middlewares/staticAssets'; // 静态资源
import H from '@/middlewares/routesH'; // 响应

import servicesUpload from '@/services/upload';

const app = new Elysia()
  .onError(async ({ error }: any) => H(error.status, error.message))
  .use(staticAssets(31536000)) // 缓存一年
  .use(cors({ origin: [/.*\.baidu\.com$/] }))
  .use(swagger({ path: '/help' }))
  .use(servicesUpload.router);

export default app;
