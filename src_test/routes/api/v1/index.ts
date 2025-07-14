import { Elysia } from 'elysia';

import { userRoutes } from './user';
import { adminRoutes } from './admin';
import { authMiddleware } from '@_text/middleware/auth.middleware';

export const v1Routes = new Elysia()
  .use(authMiddleware)
  .group('/user', (app) => app.use(userRoutes))
  .group('/admin', (app) => app.use(adminRoutes));
