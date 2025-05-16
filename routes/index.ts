import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

import { staticAssets } from '@/middlewares/staticAssets';
import { errorHandler } from '@/middlewares/errorHandler';

import servicesData from '@/services/data';

const app = new Elysia()
  .use(errorHandler())
  .use(
    cors({
      origin: [/.*\.baidu\.com$/],
    })
  )
  .use(
    swagger({
      path: '/help',
    })
  )
  .use(staticAssets())
  .use(servicesData.router);

export default app;
