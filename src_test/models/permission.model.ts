import { getDatabase } from '@_text/database';
import { Permission } from '@_text/types';

export class PermissionModel {
  static async create(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = db.run(
      `INSERT INTO permissions (name, code, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [permission.name, permission.code, permission.description || null, now, now]
    );

    return {
      id: result.lastInsertId as number,
      ...permission,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async findById(id: number): Promise<Permission | null> {
    const db = await getDatabase();
    const permission = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM permissions WHERE id = ?`
      )
      .get(id) as Permission | null;

    return permission;
  }

  static async findByCode(code: string): Promise<Permission | null> {
    const db = await getDatabase();
    const permission = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM permissions WHERE code = ?`
      )
      .get(code) as Permission | null;

    return permission;
  }

  static async update(id: number, data: Partial<Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // 构建更新语句
    const fields = Object.keys(data).map((key) => `${key === 'createdAt' ? 'created_at' : key === 'updatedAt' ? 'updated_at' : key} = ?`);
    const values = Object.values(data);

    if (fields.length === 0) {
      return false;
    }

    const result = db.run(`UPDATE permissions SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`, [...values, now, id]);

    return result.changes > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM permissions WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async list(page: number = 1, limit: number = 10): Promise<Permission[]> {
    const db = await getDatabase();
    const offset = (page - 1) * limit;

    const permissions = db
      .query(
        `SELECT id, name, code, description, created_at as createdAt, updated_at as updatedAt 
       FROM permissions LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as Permission[];

    return permissions;
  }

  static async count(): Promise<number> {
    const db = await getDatabase();
    const result = db.query('SELECT COUNT(*) as count FROM permissions').get() as { count: number };
    return result.count;
  }

  // 获取用户的额外权限
  static async getUserPermissions(userId: number): Promise<Permission[]> {
    const db = await getDatabase();
    const permissions = db
      .query(
        `SELECT p.id, p.name, p.code, p.description, p.created_at as createdAt, p.updated_at as updatedAt
       FROM permissions p
       JOIN user_permissions up ON p.id = up.permission_id
       WHERE up.user_id = ?`
      )
      .all(userId) as Permission[];

    return permissions;
  }

  // 获取用户的所有权限（包括角色权限和额外权限）
  static async getAllUserPermissions(userId: number): Promise<Permission[]> {
    const db = await getDatabase();
    const permissions = db
      .query(
        `SELECT DISTINCT p.id, p.name, p.code, p.description, p.created_at as createdAt, p.updated_at as updatedAt
       FROM permissions p
       LEFT JOIN role_permissions rp ON p.id = rp.permission_id
       LEFT JOIN user_roles ur ON rp.role_id = ur.role_id
       LEFT JOIN user_permissions up ON p.id = up.permission_id
       WHERE ur.user_id = ? OR up.user_id = ?`
      )
      .all(userId, userId) as Permission[];

    return permissions;
  }

  // 为用户添加额外权限
  static async addUserPermission(userId: number, permissionId: number): Promise<boolean> {
    const db = await getDatabase();
    try {
      db.run('INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)', [userId, permissionId]);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 移除用户的额外权限
  static async removeUserPermission(userId: number, permissionId: number): Promise<boolean> {
    const db = await getDatabase();
    const result = db.run('DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?', [userId, permissionId]);
    return result.changes > 0;
  }
}
