import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';

/**
 * 主应用入口
 * 基于Elysia框架构建的RESTful API服务
 */
const app = new Elysia()
  .use(swagger())
  // 启动服务器
  .listen(process.env.PORT as string);
console.log(process.env.MYSQL_HOST);

console.log(`API文档: http://localhost:${app.server?.port}/swagger`);
