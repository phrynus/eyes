import { Elysia } from 'elysia';

const CACHEABLE_REGEX = /^(image\/|video\/|font\/)/i;

export const staticAssets = (options = { maxAge: 31536000 }) => {
  return (app: Elysia): Elysia => {
    return app.onAfterHandle(({ response, set }: any) => {
      try {
        if (CACHEABLE_REGEX.test(response.headers?.get('Content-Type'))) {
          set.headers['Cache-Control'] = `public, max-age=${options.maxAge}, immutable`;
        } else {
          set.headers['Cache-Control'] = 'no-cache';
        }
      } catch (error) {
        console.log(error);
      }
    });
  };
};
