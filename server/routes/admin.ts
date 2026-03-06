import express from "express";
import { db } from "../db";
import { requirePermission } from "../middleware";
import { slugify } from "../utils";

const router = express.Router();

router.get("/permissions", requirePermission("manage_roles"), (req, res) => {
  const perms = db.prepare("SELECT * FROM permissions").all();
  res.json(perms);
});

router.get("/users", requirePermission("manage_roles"), (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.role_id, r.name as role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id
  `).all();
  res.json(users);
});

router.put("/users/:id/role", requirePermission("manage_roles"), (req, res) => {
  const { role_id } = req.body;
  try {
    db.prepare("UPDATE users SET role_id = ? WHERE id = ?").run(role_id, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/roles", requirePermission("manage_roles"), (req, res) => {
  const roles = db.prepare("SELECT * FROM roles").all();
  const rolesWithData = roles.map((role: any) => {
    const perms = db.prepare(`
      SELECT p.* FROM permissions p 
      JOIN role_permissions rp ON p.id = rp.permission_id 
      WHERE rp.role_id = ?
    `).all(role.id);
    const typePerms = db.prepare(`
      SELECT rtp.*, et.name as type_name, et.slug as type_slug FROM role_type_permissions rtp 
      JOIN element_types et ON rtp.type_id = et.id 
      WHERE rtp.role_id = ?
    `).all(role.id);
    return { ...role, permissions: perms, type_permissions: typePerms };
  });
  res.json(rolesWithData);
});

router.post("/roles", requirePermission("manage_roles"), (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name);
  try {
    const transaction = db.transaction(() => {
      const roleId = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)").run(name, slug, description).lastInsertRowid;
      
      // Initialize type permissions for the new role
      const types = db.prepare("SELECT id FROM element_types").all() as any[];
      const insertTypePerm = db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)");
      for (const t of types) {
        insertTypePerm.run(roleId, t.id);
      }
      return roleId;
    });
    const id = transaction();
    res.json({ id, name, slug, description });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/roles/:idOrSlug/permissions", requirePermission("manage_roles"), (req, res) => {
  const { permission_ids } = req.body;
  const { idOrSlug } = req.params;
  const isId = /^\d+$/.test(idOrSlug);
  try {
    const transaction = db.transaction(() => {
      const role = db.prepare(`SELECT id FROM roles WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
      if (!role) throw new Error("Role not found");
      const roleId = role.id;

      db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(roleId);
      const insert = db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
      for (const pid of permission_ids) insert.run(roleId, pid);
    });
    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/roles/:idOrSlug/type-permissions/:typeIdOrSlug", requirePermission("manage_roles"), (req, res) => {
  const { can_view, can_create, can_edit, can_delete } = req.body;
  const { idOrSlug, typeIdOrSlug } = req.params;
  
  const isRoleId = /^\d+$/.test(idOrSlug);
  const isTypeId = /^\d+$/.test(typeIdOrSlug);

  try {
    const role = db.prepare(`SELECT id FROM roles WHERE ${isRoleId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    const type = db.prepare(`SELECT id FROM element_types WHERE ${isTypeId ? "id" : "slug"} = ?`).get(typeIdOrSlug) as any;
    
    if (!role || !type) throw new Error("Role or Type not found");

    db.prepare(`
      UPDATE role_type_permissions SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ? 
      WHERE role_id = ? AND type_id = ?
    `).run(can_view ? 1 : 0, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0, role.id, type.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
