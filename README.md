# 用户认证系统

基于 Elysia 和 Bun.SQL 构建的用户登录注册系统。

## 功能特性

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT 令牌认证
- ✅ 令牌刷新
- ✅ 密码哈希加密
- ✅ 数据库连接（MySQL）
- ✅ API 文档（OpenAPI/Swagger）
- ✅ 输入验证
- ✅ 错误处理

## 技术栈

- **运行时**: Bun
- **框架**: Elysia
- **数据库**: MySQL (使用 Bun.SQL)
- **认证**: JWT
- **密码加密**: Bun 内置密码哈希
- **API 文档**: OpenAPI/Swagger

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

复制 `.env.local` 文件并根据你的数据库配置修改：

```bash
# 服务端口
PORT=3433

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=test01
MYSQL_DATABASE=test01
MYSQL_PASSWORD=test01

# JWT 密钥
JWT_ACCESS_SECRET=cwyrgmexxaovrkjmvxbfodzwpqmoeojr
JWT_REFRESH_SECRET=ziagvdzprakotqihumhxewlvcbbnuuxl
JWT_ACCESS_EXPIRES=3600
JWT_REFRESH_EXPIRES=604800
```

### 3. 初始化数据库

```bash
bun run setup
```

或者单独初始化数据库表：

```bash
bun run init-db
```

### 4. 启动开发服务器

```bash
bun run dev
```

服务将在 `http://localhost:3433` 启动。

## API 接口

### 基础接口

- `GET /health` - 健康检查
- `GET /openapi` - API 文档

### 认证接口

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新令牌
- `GET /auth/me` - 获取当前用户信息（需要认证）
- `POST /auth/logout` - 用户登出

### 接口示例

#### 用户注册

```bash
curl -X POST http://localhost:3433/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com",
    "nickname": "测试用户"
  }'
```

#### 用户登录

```bash
curl -X POST http://localhost:3433/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

#### 获取用户信息

```bash
curl -X GET http://localhost:3433/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 数据库结构

系统使用以下主要数据表：

### users 表
- `id` - 用户ID（主键）
- `username` - 用户名（唯一）
- `password_hash` - 密码哈希
- `email` - 邮箱（唯一，可选）
- `nickname` - 昵称
- `avatar_url` - 头像URL
- `status` - 状态（1-正常，0-禁用）
- `last_login_at` - 最后登录时间
- `created_at` - 创建时间
- `updated_at` - 更新时间

### applications 表
- `id` - 应用ID（主键）
- `app_code` - 应用编码（唯一）
- `app_name` - 应用名称
- `description` - 应用描述
- `icon_url` - 应用图标URL
- `status` - 状态

## 项目结构

```
src/
├── index.ts          # 主入口文件
├── database.ts       # 数据库连接和操作
├── auth.ts          # 认证服务和中间件
├── init-db.ts       # 数据库初始化脚本
├── setup.ts         # 系统设置脚本
└── routes/
    └── auth.ts      # 认证路由
```

## 开发说明

### 添加新的认证中间件

```typescript
import { authMiddleware } from './auth';

// 在需要认证的路由中使用
.get('/protected', async (context) => {
  const authResult = await authMiddleware(context);
  if (authResult !== true) {
    return authResult;
  }
  
  // 认证通过，可以访问 context.user
  return { message: '这是受保护的资源' };
})
```

### 自定义JWT配置

在 `src/auth.ts` 中修改 `jwtConfig` 对象来自定义JWT设置。

### 扩展用户模型

可以在 `users` 表中添加 `json_data` 字段来存储额外的用户信息。

## 安全注意事项

1. 请确保在生产环境中使用强密码作为JWT密钥
2. 定期轮换JWT密钥
3. 考虑实现令牌黑名单机制
4. 启用HTTPS
5. 实施速率限制
6. 定期更新依赖包

## 测试

使用提供的 `test-api.http` 文件来测试API接口，或者访问 `http://localhost:3433/openapi` 查看交互式API文档。

## 许可证

MIT License