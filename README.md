# 多程序后端用户管理系统框架构建

> 可扩展性强，模块化，写简单点

## 技术栈

- **运行时**: Bun
- **框架**: ElysiaJS
- **数据库**: SQLite (通过 `bun:sqlite`)
- **Web 服务器**: Bun.serve (支持 WebSocket)
- **加密**: Argon2
- **核心中间件**:
  - `@elysiajs/cors` - 处理跨域请求
  - `@elysiajs/jwt` - JWT 认证
  - `@elysiajs/swagger` - API 文档生成

## 核心功能需求

### 1. 用户与权限管理

- 用户密码加密存储
- 实现基于 RBAC (基于角色的访问控制) 的权限系统
- 一个用户可能有多个角色
- 用户可以单独额外赋予权限
- 权限格式采用 `resource:target:action` 标准化结构,支持"*:*:*"

### 2. 认证体系

- 实现单点登录 (SSO) 功能
- Token自动刷新机制
- 第三方接入鉴权由外部系统负责
- 本系统仅负责权限管理，不负责权限校验

### 3. API 分层设计

- **用户 API**:
  - 面向终端客户的功能接口
- **管理员 API**:
  - 为系统前端管理面板提供接口
  - 包含用户管理、权限分配等功能

### 4. WebSocket 功能

- 仅处理消息的接收和发送
- 不包含业务逻辑处理

### 5. 返回数据框架

```json
{
    "avatar": "https://avatars.githubusercontent.com/u/59019395",
    "username": "admin",
    "nickname": "清欢",
    "roles": [
        "expires"
    ],
    "permissions": [
        "*:*:*",
        "resource:target:action"
    ],
    "extraPermissions": [
        "resource:target:action"
    ],
    "accessToken": "eyJhbGciOiJIUzUxMiJ9.admin",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
    "expires": "2030/10/30 00:00:00"
}
```
