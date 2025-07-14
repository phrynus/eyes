import { Elysia, t } from 'elysia';
import { PermissionModel } from '@_text/models/permission.model';

export const permissionManageRoutes = new Elysia()
  // 获取权限列表
  .get(
    '/',
    async ({ query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);

      const permissions = await PermissionModel.list(page, limit);
      const total = await PermissionModel.count();

      return {
        success: true,
        data: {
          list: permissions,
          pagination: {
            page,
            limit,
            total,
          },
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(
          t.String({
            description: '页码，默认为1',
          })
        ),
        limit: t.Optional(
          t.String({
            description: '每页数量，默认为10',
          })
        ),
      }),
      detail: {
        summary: '获取权限列表',
        description: '分页获取所有权限信息',
        tags: ['权限管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 获取权限详情
  .get(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);
      const permission = await PermissionModel.findById(id);

      if (!permission) {
        return {
          success: false,
          message: '权限不存在',
        };
      }

      return {
        success: true,
        data: permission,
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '权限ID',
        }),
      }),
      detail: {
        summary: '获取权限详情',
        description: '获取指定权限的详细信息',
        tags: ['权限管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 创建权限
  .post(
    '/',
    async ({ body }) => {
      const { name, code, description } = body;

      // 验证权限代码格式
      const codePattern = /^[\w\*]+:[\w\*]+:[\w\*]+$/;
      if (!codePattern.test(code)) {
        return {
          success: false,
          message: '权限代码格式无效，必须是 resource:target:action 格式',
        };
      }

      // 检查权限代码是否已存在
      const existingPermission = await PermissionModel.findByCode(code);
      if (existingPermission) {
        return {
          success: false,
          message: '权限代码已存在',
        };
      }

      // 创建权限
      const permission = await PermissionModel.create({
        name,
        code,
        description,
      });

      return {
        success: true,
        data: permission,
      };
    },
    {
      body: t.Object({
        name: t.String({
          description: '权限名称',
        }),
        code: t.String({
          description: '权限代码，格式为resource:target:action，例如 user:profile:read',
        }),
        description: t.Optional(
          t.String({
            description: '权限描述',
          })
        ),
      }),
      detail: {
        summary: '创建权限',
        description: '创建新权限，权限代码必须符合resource:target:action格式',
        tags: ['权限管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 更新权限
  .put(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id);
      const { name, code, description } = body;

      // 检查权限是否存在
      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return {
          success: false,
          message: '权限不存在',
        };
      }

      // 如果更改权限代码，验证格式并检查是否已存在
      if (code && code !== permission.code) {
        // 验证权限代码格式
        const codePattern = /^[\w\*]+:[\w\*]+:[\w\*]+$/;
        if (!codePattern.test(code)) {
          return {
            success: false,
            message: '权限代码格式无效，必须是 resource:target:action 格式',
          };
        }

        // 检查权限代码是否已存在
        const existingPermission = await PermissionModel.findByCode(code);
        if (existingPermission) {
          return {
            success: false,
            message: '权限代码已存在',
          };
        }
      }

      // 更新权限
      const success = await PermissionModel.update(id, {
        name,
        code,
        description,
      });

      if (!success) {
        return {
          success: false,
          message: '更新权限失败',
        };
      }

      return {
        success: true,
        message: '更新权限成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '权限ID',
        }),
      }),
      body: t.Object({
        name: t.Optional(
          t.String({
            description: '权限名称',
          })
        ),
        code: t.Optional(
          t.String({
            description: '权限代码，格式为resource:target:action，例如 user:profile:read',
          })
        ),
        description: t.Optional(
          t.String({
            description: '权限描述',
          })
        ),
      }),
      detail: {
        summary: '更新权限信息',
        description: '更新指定权限的信息，如果更改权限代码，必须符合resource:target:action格式',
        tags: ['权限管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 删除权限
  .delete(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);

      // 检查权限是否存在
      const permission = await PermissionModel.findById(id);
      if (!permission) {
        return {
          success: false,
          message: '权限不存在',
        };
      }

      // 删除权限
      const success = await PermissionModel.delete(id);

      if (!success) {
        return {
          success: false,
          message: '删除权限失败',
        };
      }

      return {
        success: true,
        message: '删除权限成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '权限ID',
        }),
      }),
      detail: {
        summary: '删除权限',
        description: '删除指定权限',
        tags: ['权限管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  );
