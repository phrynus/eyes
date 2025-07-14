import { getDatabase } from '@_text/database';
import { Role, Permission } from '@_text/types';

export class RoleModel {
  static async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = db.run(
      `INSERT INTO roles (name, code, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [role.name, role.code, role.description || null, now, now]
    );

    return {
      id: result.lastInsertId as number,
      ...role,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async findById(id: number): Promise<Role | null> {
    const db = await getDatabase();
    const role = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM roles WHERE id = ?`
      )
      .get(id) as Role | null;

    return role;
  }

  static async findByCode(code: string): Promise<Role | null> {
    const db = await getDatabase();
    const role = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM roles WHERE code = ?`
      )
      .get(code) as Role | null;

    return role;
  }

  static async update(id: number, data: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // 构建更新语句
    const fields = Object.keys(data).map((key) => `${key === 'createdAt' ? 'created_at' : key === 'updatedAt' ? 'updated_at' : key} = ?`);
    const values = Object.values(data);

    if (fields.length === 0) {
      return false;
    }

    const result = db.run(`UPDATE roles SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`, [...values, now, id]);

    return result.changes > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM roles WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async list(page: number = 1, limit: number = 10): Promise<Role[]> {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    const roles = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM roles LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as Role[];

    return roles;
  }

  static async count(): Promise<number> {
    const db = await getDatabase();
    const result = db.query('SELECT COUNT(*) as count FROM roles').get() as { count: number };
    return result.count;
  }

  // 获取角色的所有权限
  static async getPermissions(roleId: number): Promise<Permission[]> {
    const db = await getDatabase();
    const permissions = db
      .query(
        `SELECT p.id, p.name, p.code, p.description, p.created_at as createdAt, p.updated_at as updatedAt
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`
      )
      .all(roleId) as Permission[];

    return permissions;
  }

  // 为角色添加权限
  static async addPermission(roleId: number, permissionId: number): Promise<boolean> {
    const db = await getDatabase();
    try {
      db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, permissionId]);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 移除角色的权限
  static async removePermission(roleId: number, permissionId: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?', [roleId, permissionId]);
    return result.changes > 0;
  }

  // 获取用户的所有角色
  static async getUserRoles(userId: number): Promise<Role[]> {
    const db = await getDatabase();
    const roles = db
      .query(
        `SELECT r.id, r.name, r.code, r.description, r.created_at as createdAt, r.updated_at as updatedAt
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`
      )
      .all(userId) as Role[];

    return roles;
  }

  // 为用户添加角色
  static async addUserRole(userId: number, roleId: number): Promise<boolean> {
    const db = await getDatabase();
    try {
      db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 移除用户的角色
  static async removeUserRole(userId: number, roleId: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId]);
    return result.changes > 0;
  }
}
