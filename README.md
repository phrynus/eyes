# Bun.js 认证系统

基于 Bun.js、Elysia 框架构建的模块化认证系统，支持 JWT 认证和 OTP 双因子验证。

## 🚀 特性

- **模块化架构**: 清晰的分层设计，低耦合高内聚
- **类型安全**: 完整的 TypeScript 类型定义
- **JWT 认证**: 基于 @elysiajs/jwt 的安全认证
- **OTP 验证**: 集成 otplib 实现双因子认证
- **数据库操作**: 使用 Bun.SQL 进行类型安全的数据库操作
- **RESTful API**: 标准的 REST 接口设计
- **权限管理**: 完整的 RBAC 权限控制系统

## 📁 项目结构

```
src/
├── db/                 # 数据库模块
│   └── index.ts       # 数据库连接和CRUD操作
├── auth/              # 认证模块
│   └── index.ts       # JWT和OTP认证逻辑
├── routes/            # 路由模块
│   ├── index.ts       # 路由入口
│   ├── auth.ts        # 认证相关路由
│   ├── user.ts        # 用户相关路由
│   └── application.ts # 应用相关路由
├── utils/             # 工具模块
│   └── index.ts       # 通用工具函数
├── types/             # 类型定义
│   └── index.ts       # TypeScript类型定义
└── index.ts           # 应用入口文件
```

## 🛠️ 安装和运行

### 环境要求

- Bun >= 1.0.0
- Node.js >= 18.0.0 (可选，用于兼容性)

### 安装依赖

```bash
bun install
```

### 环境配置

复制环境配置文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# 数据库配置
DATABASE_PATH=database.sqlite

# JWT配置 - 生产环境请使用强密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务配置
PORT=3000
NODE_ENV=development

# 服务名称（用于TOTP）
SERVICE_NAME=认证系统
```

### 运行项目

开发模式（热重载）：

```bash
bun run dev
```

生产模式：

```bash
bun run start
```

## 📚 API 文档

### 认证接口

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码",
  "appCode": "应用代码（可选）",
  "otpCode": "OTP验证码（可选）"
}
```

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码",
  "email": "邮箱（可选）",
  "nickname": "昵称（可选）"
}
```

#### Token验证
```http
POST /api/auth/verify
Authorization: Bearer <JWT_TOKEN>
```

#### 生成TOTP密钥
```http
POST /api/auth/totp/generate
Authorization: Bearer <JWT_TOKEN>
```

#### 验证OTP
```http
POST /api/auth/otp/verify
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "otpCode": "123456"
}
```

### 用户接口

#### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer <JWT_TOKEN>
```

#### 获取用户应用列表
```http
GET /api/user/applications?page=1&pageSize=10
Authorization: Bearer <JWT_TOKEN>
```

#### 获取用户角色
```http
GET /api/user/roles/:appId
Authorization: Bearer <JWT_TOKEN>
```

#### 获取用户权限
```http
GET /api/user/permissions/:appId
Authorization: Bearer <JWT_TOKEN>
```

### 应用接口

#### 获取应用列表
```http
GET /api/application/list?page=1&pageSize=10
Authorization: Bearer <JWT_TOKEN>
```

#### 获取应用详情
```http
GET /api/application/:appId
Authorization: Bearer <JWT_TOKEN>
```

#### 权限检查
```http
POST /api/application/:appId/check-permission
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "permissionCode": "resource:target:action"
}
```

## 🗄️ 数据库设计

系统包含以下核心表：

- **users**: 用户表
- **applications**: 应用表
- **user_applications**: 用户-应用关联表
- **roles**: 角色表
- **user_roles**: 用户-角色关联表
- **permissions**: 权限表
- **role_permissions**: 角色-权限关联表
- **user_permissions**: 用户-权限关联表

详细的数据库结构请参考 `sql.sql` 文件。

## 🔐 安全特性

### JWT 认证
- 使用 HS256 算法签名
- Token 有效期 24 小时
- 支持 Token 刷新机制

### OTP 双因子验证
- 基于 TOTP 算法
- 支持 Google Authenticator 等应用
- 30秒时间窗口

### 密码安全
- 使用 Bun 内置的密码哈希
- 强密码策略验证
- 防止密码重用

### 权限控制
- 基于 RBAC 的权限模型
- 支持角色继承
- 细粒度权限控制

## 🧪 开发指南

### 添加新的路由

1. 在 `src/routes/` 目录下创建新的路由文件
2. 实现路由逻辑
3. 在 `src/routes/index.ts` 中注册路由

### 扩展数据库操作

1. 在 `src/db/index.ts` 中添加新的数据库操作方法
2. 确保类型安全
3. 添加适当的错误处理

### 添加新的工具函数

1. 在 `src/utils/index.ts` 中添加工具函数
2. 提供完整的 JSDoc 注释
3. 确保函数的纯净性和可测试性

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 这是一个示例项目，生产环境使用前请进行充分的安全审计和测试。