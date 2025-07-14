import { Elysia } from 'elysia';
import { authMiddleware } from '@_text/middleware/auth.middleware';

export const wsRoutes = new Elysia().use(authMiddleware).ws('/message', {
  // 连接打开时
  open(ws) {
    console.log('WebSocket连接已打开:', ws.id);
  },

  // 接收消息
  message(ws, message) {
    console.log(`接收到来自 ${ws.id} 的消息:`, message);

    // 检查消息格式
    if (typeof message !== 'object' || !message) {
      ws.send({
        type: 'error',
        message: '无效的消息格式',
      });
      return;
    }

    // 回显消息（示例）
    ws.send({
      type: 'message',
      data: {
        id: Date.now(),
        content: message,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // 连接关闭时
  close(ws) {
    console.log('WebSocket连接已关闭:', ws.id);
  },

  // 连接错误时
  error(ws, error) {
    console.error('WebSocket连接发生错误:', ws.id, error);
  },
});
