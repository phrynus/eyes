import { Elysia } from 'elysia';

export default (app: Elysia): Elysia =>
  app.get('/info', (ctx) => {
    return 'Hello World!';
  });
