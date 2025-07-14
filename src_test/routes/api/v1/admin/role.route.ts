import { Elysia, t } from 'elysia';
import { RoleModel } from '@_text/models/role.model';
import { PermissionModel } from '@_text/models/permission.model';

export const roleManageRoutes = new Elysia()
  // 获取角色列表
  .get(
    '/',
    async ({ query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);

      const roles = await RoleModel.list(page, limit);
      const total = await RoleModel.count();

      return {
        success: true,
        data: {
          list: roles,
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
        summary: '获取角色列表',
        description: '分页获取所有角色信息',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 获取角色详情
  .get(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);
      const role = await RoleModel.findById(id);

      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 获取角色权限
      const permissions = await RoleModel.getPermissions(id);
      const permissionCodes = permissions.map((permission) => permission.code);

      return {
        success: true,
        data: {
          ...role,
          permissions: permissionCodes,
        },
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '角色ID',
        }),
      }),
      detail: {
        summary: '获取角色详情',
        description: '获取指定角色的详细信息，包括权限列表',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 创建角色
  .post(
    '/',
    async ({ body }) => {
      const { name, code, description, permissions } = body;

      // 检查角色代码是否已存在
      const existingRole = await RoleModel.findByCode(code);
      if (existingRole) {
        return {
          success: false,
          message: '角色代码已存在',
        };
      }

      // 创建角色
      const role = await RoleModel.create({
        name,
        code,
        description,
      });

      // 如果提供了权限，添加角色权限
      if (permissions && Array.isArray(permissions)) {
        for (const permissionCode of permissions) {
          const permission = await PermissionModel.findByCode(permissionCode);
          if (permission) {
            await RoleModel.addPermission(role.id, permission.id);
          }
        }
      }

      return {
        success: true,
        data: role,
      };
    },
    {
      body: t.Object({
        name: t.String({
          description: '角色名称',
        }),
        code: t.String({
          description: '角色代码（唯一）',
        }),
        description: t.Optional(
          t.String({
            description: '角色描述',
          })
        ),
        permissions: t.Optional(
          t.Array(
            t.String({
              description: '权限代码列表',
            })
          )
        ),
      }),
      detail: {
        summary: '创建角色',
        description: '创建新角色，并可选择性地分配权限',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 更新角色
  .put(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id);
      const { name, code, description, permissions } = body;

      // 检查角色是否存在
      const role = await RoleModel.findById(id);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 如果更改角色代码，检查新角色代码是否已存在
      if (code && code !== role.code) {
        const existingRole = await RoleModel.findByCode(code);
        if (existingRole) {
          return {
            success: false,
            message: '角色代码已存在',
          };
        }
      }

      // 更新角色
      const success = await RoleModel.update(id, {
        name,
        code,
        description,
      });

      if (!success) {
        return {
          success: false,
          message: '更新角色失败',
        };
      }

      // 如果提供了权限，更新角色权限
      if (permissions && Array.isArray(permissions)) {
        // 获取当前角色的权限
        const currentPermissions = await RoleModel.getPermissions(id);
        const currentPermissionCodes = currentPermissions.map((permission) => permission.code);

        // 找出需要删除的权限
        const permissionsToRemove = currentPermissions.filter((permission) => !permissions.includes(permission.code));

        // 找出需要添加的权限
        const permissionsToAdd = permissions.filter((permissionCode) => !currentPermissionCodes.includes(permissionCode));

        // 删除权限
        for (const permission of permissionsToRemove) {
          await RoleModel.removePermission(id, permission.id);
        }

        // 添加权限
        for (const permissionCode of permissionsToAdd) {
          const permission = await PermissionModel.findByCode(permissionCode);
          if (permission) {
            await RoleModel.addPermission(id, permission.id);
          }
        }
      }

      return {
        success: true,
        message: '更新角色成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '角色ID',
        }),
      }),
      body: t.Object({
        name: t.Optional(
          t.String({
            description: '角色名称',
          })
        ),
        code: t.Optional(
          t.String({
            description: '角色代码（唯一）',
          })
        ),
        description: t.Optional(
          t.String({
            description: '角色描述',
          })
        ),
        permissions: t.Optional(
          t.Array(
            t.String({
              description: '权限代码列表',
            })
          )
        ),
      }),
      detail: {
        summary: '更新角色信息',
        description: '更新指定角色的信息，包括基本信息和权限分配',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 删除角色
  .delete(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);

      // 检查角色是否存在
      const role = await RoleModel.findById(id);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 删除角色
      const success = await RoleModel.delete(id);

      if (!success) {
        return {
          success: false,
          message: '删除角色失败',
        };
      }

      return {
        success: true,
        message: '删除角色成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '角色ID',
        }),
      }),
      detail: {
        summary: '删除角色',
        description: '删除指定角色',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 为角色添加权限
  .post(
    '/:id/permission/:permissionCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { permissionCode } = params;

      // 检查角色是否存在
      const role = await RoleModel.findById(id);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 检查权限是否存在
      const permission = await PermissionModel.findByCode(permissionCode);
      if (!permission) {
        return {
          success: false,
          message: '权限不存在',
        };
      }

      // 添加权限
      const success = await RoleModel.addPermission(id, permission.id);

      if (!success) {
        return {
          success: false,
          message: '添加权限失败',
        };
      }

      return {
        success: true,
        message: '添加权限成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '角色ID',
        }),
        permissionCode: t.String({
          description: '权限代码，格式为resource:target:action',
        }),
      }),
      detail: {
        summary: '为角色添加权限',
        description: '为指定角色添加特定权限',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 移除角色的权限
  .delete(
    '/:id/permission/:permissionCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { permissionCode } = params;

      // 检查角色是否存在
      const role = await RoleModel.findById(id);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 检查权限是否存在
      const permission = await PermissionModel.findByCode(permissionCode);
      if (!permission) {
        return {
          success: false,
          message: '权限不存在',
        };
      }

      // 移除权限
      const success = await RoleModel.removePermission(id, permission.id);

      if (!success) {
        return {
          success: false,
          message: '移除权限失败',
        };
      }

      return {
        success: true,
        message: '移除权限成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '角色ID',
        }),
        permissionCode: t.String({
          description: '权限代码，格式为resource:target:action',
        }),
      }),
      detail: {
        summary: '移除角色的权限',
        description: '移除指定角色的特定权限',
        tags: ['角色管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  );
