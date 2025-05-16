import log from '@/utils/logger';
import app from '@/routes';

app.listen(Bun.env.PORT || 3000, () => {
  log.info(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
});
