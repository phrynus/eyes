import { Elysia, t } from 'elysia';
import H from '@/middlewares/routesH'; // 响应

export default new Elysia({
  prefix: '/upload',
})
  .use(async (ctx) => {
    return ctx;
  })
  .post(
    '/',
    async ({ body: { file } }) => {
      try {
        if (!file) throw 'No file uploaded';
        console.log(file);
        return H(200, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } catch (error: any) {
        return H(400, error);
      }
    },
    {
      body: t.Object({
        file: t.File({
          type: ['image/*'],
          size: 1024 * 1024 * 10, // 10MB
        }),
      }),
    }
  );
