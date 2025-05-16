import { Elysia } from 'elysia';

export const errorHandler = () => {
  return (app: Elysia): Elysia => {
    return app.onError(({ code }) => {
      if (code === 'NOT_FOUND') return 'Sorry :(';
    });
  };
};
