# eyes
```
eyes/
├── index                  # 应用入口文件
├── config/                # 配置文件
│   ├── index.js           # 配置聚合
│   ├── database.js        # 数据库配置
│   └── env.js             # 环境变量配置
├── routes/                # 路由定义
│   ├── api/               # API路由
│   │   ├── user.routes.js
│   │   └── product.routes.js
├── controllers/           # 控制器
│   ├── user.controller.js
│   └── product.controller.js
├── models/                # 数据模型
│   ├── user.model.js
│   └── product.model.js
├── middlewares/           # 自定义中间件
│   ├── auth.js            # 认证中间件
│   └── errorHandler.js    # 错误处理中间件
├── services/              # 业务逻辑层
│   ├── user.service.js
│   └── product.service.js
├── utils/                 # 工具函数
│   ├── logger.js          # 日志工具
│   └── helpers.js         # 辅助函数
└── test/                  # 测试文件
    ├── unit/              # 单元测试
    └── integration/       # 集成测试
```