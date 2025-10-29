import { app } from '~/routes';
import { sqlite } from '~/config/sqlite';

sqlite.clear();

// 启动服务;
app.listen((process.env.PORT as string) || 3000, () => {
  console.log(`服务器已启动，手册：http://localhost:${app.server?.port}/openapi`);
});
