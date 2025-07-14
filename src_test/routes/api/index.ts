import { Elysia } from 'elysia';

import { v1Routes } from './v1';

export const apiRoutes = new Elysia().group('/v1', (app) => app.use(v1Routes));
