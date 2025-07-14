import { Elysia, t } from 'elysia';
import { UserModel } from '@_text/models/user.model';
import { RoleModel } from '@_text/models/role.model';
import { PermissionModel } from '@_text/models/permission.model';

export const userManageRoutes = new Elysia()
  // 获取用户列表
  .get(
    '/',
    async ({ query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);

      const users = await UserModel.list(page, limit);
      const total = await UserModel.count();

      // 不返回密码
      const safeUsers = users.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      return {
        success: true,
        data: {
          list: safeUsers,
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
        summary: '获取用户列表',
        description: '分页获取所有用户信息',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 获取用户详情
  .get(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);
      const user = await UserModel.findById(id);

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 获取用户角色
      const roles = await RoleModel.getUserRoles(id);
      const roleCodes = roles.map((role) => role.code);

      // 获取用户额外权限
      const extraPermissions = await PermissionModel.getUserPermissions(id);
      const extraPermissionCodes = extraPermissions.map((permission) => permission.code);

      // 不返回密码
      const { password, ...safeUser } = user;

      return {
        success: true,
        data: {
          ...safeUser,
          roles: roleCodes,
          extraPermissions: extraPermissionCodes,
        },
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '用户ID',
        }),
      }),
      detail: {
        summary: '获取用户详情',
        description: '获取指定用户的详细信息，包括角色和额外权限',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 创建用户
  .post(
    '/',
    async ({ body }) => {
      const { username, password, nickname, avatar, email, phone, roles } = body;

      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return {
          success: false,
          message: '用户名已存在',
        };
      }

      // 创建用户
      const user = await UserModel.create({
        username,
        password,
        nickname,
        avatar,
        email,
        phone,
      });

      // 如果提供了角色，添加用户角色
      if (roles && Array.isArray(roles)) {
        for (const roleCode of roles) {
          const role = await RoleModel.findByCode(roleCode);
          if (role) {
            await RoleModel.addUserRole(user.id, role.id);
          }
        }
      }

      // 不返回密码
      const { password: _, ...safeUser } = user;

      return {
        success: true,
        data: safeUser,
      };
    },
    {
      body: t.Object({
        username: t.String({
          description: '用户名（邮箱）',
        }),
        password: t.String({
          description: '密码',
        }),
        nickname: t.Optional(
          t.String({
            description: '昵称',
          })
        ),
        avatar: t.Optional(
          t.String({
            description: '头像URL',
          })
        ),
        email: t.Optional(
          t.String({
            description: '邮箱',
          })
        ),
        phone: t.Optional(
          t.String({
            description: '电话号码',
          })
        ),
        roles: t.Optional(
          t.Array(
            t.String({
              description: '角色代码列表',
            })
          )
        ),
      }),
      detail: {
        summary: '创建用户',
        description: '创建新用户，并可选择性地分配角色',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 更新用户
  .put(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id);
      const { username, password, nickname, avatar, email, phone, roles } = body;

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 如果更改用户名，检查新用户名是否已存在
      if (username && username !== user.username) {
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
          return {
            success: false,
            message: '用户名已存在',
          };
        }
      }

      // 更新用户
      const success = await UserModel.update(id, {
        username,
        password,
        nickname,
        avatar,
        email,
        phone,
      });

      if (!success) {
        return {
          success: false,
          message: '更新用户失败',
        };
      }

      // 如果提供了角色，更新用户角色
      if (roles && Array.isArray(roles)) {
        // 获取当前用户的角色
        const currentRoles = await RoleModel.getUserRoles(id);
        const currentRoleCodes = currentRoles.map((role) => role.code);

        // 找出需要删除的角色
        const rolesToRemove = currentRoles.filter((role) => !roles.includes(role.code));

        // 找出需要添加的角色
        const rolesToAdd = roles.filter((roleCode) => !currentRoleCodes.includes(roleCode));

        // 删除角色
        for (const role of rolesToRemove) {
          await RoleModel.removeUserRole(id, role.id);
        }

        // 添加角色
        for (const roleCode of rolesToAdd) {
          const role = await RoleModel.findByCode(roleCode);
          if (role) {
            await RoleModel.addUserRole(id, role.id);
          }
        }
      }

      return {
        success: true,
        message: '更新用户成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '用户ID',
        }),
      }),
      body: t.Object({
        username: t.Optional(
          t.String({
            description: '用户名（邮箱）',
          })
        ),
        password: t.Optional(
          t.String({
            description: '密码',
          })
        ),
        nickname: t.Optional(
          t.String({
            description: '昵称',
          })
        ),
        avatar: t.Optional(
          t.String({
            description: '头像URL',
          })
        ),
        email: t.Optional(
          t.String({
            description: '邮箱',
          })
        ),
        phone: t.Optional(
          t.String({
            description: '电话号码',
          })
        ),
        roles: t.Optional(
          t.Array(
            t.String({
              description: '角色代码列表',
            })
          )
        ),
      }),
      detail: {
        summary: '更新用户信息',
        description: '更新指定用户的信息，包括基本信息和角色分配',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 删除用户
  .delete(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id);

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 删除用户
      const success = await UserModel.delete(id);

      if (!success) {
        return {
          success: false,
          message: '删除用户失败',
        };
      }

      return {
        success: true,
        message: '删除用户成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '用户ID',
        }),
      }),
      detail: {
        summary: '删除用户',
        description: '删除指定用户',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 为用户添加角色
  .post(
    '/:id/role/:roleCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { roleCode } = params;

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 检查角色是否存在
      const role = await RoleModel.findByCode(roleCode);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 添加角色
      const success = await RoleModel.addUserRole(id, role.id);

      if (!success) {
        return {
          success: false,
          message: '添加角色失败',
        };
      }

      return {
        success: true,
        message: '添加角色成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '用户ID',
        }),
        roleCode: t.String({
          description: '角色代码',
        }),
      }),
      detail: {
        summary: '为用户添加角色',
        description: '为指定用户添加特定角色',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 移除用户的角色
  .delete(
    '/:id/role/:roleCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { roleCode } = params;

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 检查角色是否存在
      const role = await RoleModel.findByCode(roleCode);
      if (!role) {
        return {
          success: false,
          message: '角色不存在',
        };
      }

      // 移除角色
      const success = await RoleModel.removeUserRole(id, role.id);

      if (!success) {
        return {
          success: false,
          message: '移除角色失败',
        };
      }

      return {
        success: true,
        message: '移除角色成功',
      };
    },
    {
      params: t.Object({
        id: t.String({
          description: '用户ID',
        }),
        roleCode: t.String({
          description: '角色代码',
        }),
      }),
      detail: {
        summary: '移除用户的角色',
        description: '移除指定用户的特定角色',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 为用户添加额外权限
  .post(
    '/:id/permission/:permissionCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { permissionCode } = params;

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
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
      const success = await PermissionModel.addUserPermission(id, permission.id);

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
          description: '用户ID',
        }),
        permissionCode: t.String({
          description: '权限代码，格式为resource:target:action',
        }),
      }),
      detail: {
        summary: '为用户添加额外权限',
        description: '为指定用户添加特定的额外权限',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // 移除用户的额外权限
  .delete(
    '/:id/permission/:permissionCode',
    async ({ params }) => {
      const id = Number(params.id);
      const { permissionCode } = params;

      // 检查用户是否存在
      const user = await UserModel.findById(id);
      if (!user) {
        return {
          success: false,
          message: '用户不存在',
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
      const success = await PermissionModel.removeUserPermission(id, permission.id);

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
          description: '用户ID',
        }),
        permissionCode: t.String({
          description: '权限代码，格式为resource:target:action',
        }),
      }),
      detail: {
        summary: '移除用户的额外权限',
        description: '移除指定用户的特定额外权限',
        tags: ['用户管理'],
        security: [{ bearerAuth: [] }],
      },
    }
  );
