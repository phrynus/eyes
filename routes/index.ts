import { Elysia, type Context as BaseContext } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { auth } from './auth';

const app = new Elysia()
  .use(cors({ origin: [/.*\.baidu\.com$/] }))
  .use(swagger({ path: '/help' }))
  .use(auth);

export default app;
