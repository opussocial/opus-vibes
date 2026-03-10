import { db } from "../db";
import { slugify } from "../utils";
import { IAdminService } from "./interfaces";
import { User, Role, Permission, TypePermission } from "../../src/types";

export class AdminService implements IAdminService {
  async getUsers(): Promise<User[]> {
    const users = db.prepare(`
      SELECT u.id, u.username, u.email, u.role_id, u.settings, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `).all() as any[];
    return users.map(u => ({
      ...u,
      settings: u.settings ? JSON.parse(u.settings) : {}
    }));
  }

  async getUserById(id: number): Promise<User | null> {
    const user = db.prepare(`
      SELECT u.id, u.username, u.email, u.role_id, u.settings, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(id) as any;
    if (!user) return null;
    return {
      ...user,
      settings: user.settings ? JSON.parse(user.settings) : {}
    };
  }

  async updateUserSettings(userId: number, settings: any): Promise<void> {
    db.prepare("UPDATE users SET settings = ? WHERE id = ?").run(JSON.stringify(settings), userId);
  }

  async updateUserRole(userId: number, roleId: number): Promise<void> {
    db.prepare("UPDATE users SET role_id = ? WHERE id = ?").run(roleId, userId);
  }

  async getRoles(): Promise<Role[]> {
    const roles = db.prepare("SELECT * FROM roles").all() as any[];
    return roles.map((role: any) => {
      const perms = db.prepare(`
        SELECT p.* FROM permissions p 
        JOIN role_permissions rp ON p.id = rp.permission_id 
        WHERE rp.role_id = ?
      `).all(role.id) as any[];
      
      const typePerms = db.prepare(`
        SELECT rtp.*, et.name as type_name, et.slug as type_slug FROM role_type_permissions rtp 
        JOIN element_types et ON rtp.type_id = et.id 
        WHERE rtp.role_id = ?
      `).all(role.id) as any[];

      return { 
        ...role, 
        permissions: perms,
        type_permissions: typePerms
      };
    });
  }

  async createRole(data: { name: string, description: string }): Promise<number> {
    const { name, description } = data;
    const slug = slugify(name);
    const transaction = db.transaction(() => {
      const roleId = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run(name, slug, description).lastInsertRowid as number;
      
      const types = db.prepare("SELECT id FROM element_types").all() as any[];
      const insertTypePerm = db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)");
      for (const t of types) {
        insertTypePerm.run(roleId, t.id);
      }
      return roleId;
    });
    return transaction();
  }

  async updateRolePermissions(roleIdOrSlug: string, permissionIds: number[]): Promise<void> {
    const isId = /^\d+$/.test(roleIdOrSlug);
    const transaction = db.transaction(() => {
      const role = db.prepare(`SELECT id FROM roles WHERE ${isId ? "id" : "slug"} = ?`).get(roleIdOrSlug) as any;
      if (!role) throw new Error("Role not found");
      const roleId = role.id;

      db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(roleId);
      const insert = db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
      for (const pid of permissionIds) {
        insert.run(roleId, pid);
      }
    });
    transaction();
  }

  async updateRoleTypePermissions(roleIdOrSlug: string, typeIdOrSlug: string, permissions: Partial<TypePermission>): Promise<void> {
    const { can_view, can_create, can_edit, can_delete } = permissions;
    const isRoleId = /^\d+$/.test(roleIdOrSlug);
    const isTypeId = /^\d+$/.test(typeIdOrSlug);

    const role = db.prepare(`SELECT id FROM roles WHERE ${isRoleId ? "id" : "slug"} = ?`).get(roleIdOrSlug) as any;
    const type = db.prepare(`SELECT id FROM element_types WHERE ${isTypeId ? "id" : "slug"} = ?`).get(typeIdOrSlug) as any;
    
    if (!role || !type) throw new Error("Role or Type not found");

    db.prepare(`
      UPDATE role_type_permissions 
      SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ? 
      WHERE role_id = ? AND type_id = ?
    `).run(
      can_view ? 1 : 0, 
      can_create ? 1 : 0, 
      can_edit ? 1 : 0, 
      can_delete ? 1 : 0, 
      role.id, 
      type.id
    );
  }

  async getPermissions(): Promise<Permission[]> {
    return db.prepare("SELECT * FROM permissions").all() as Permission[];
  }
}
