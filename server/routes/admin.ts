import express from "express";
import { db } from "../db";
import { requirePermission } from "../middleware";

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
      SELECT rtp.*, et.name as type_name FROM role_type_permissions rtp 
      JOIN element_types et ON rtp.type_id = et.id 
      WHERE rtp.role_id = ?
    `).all(role.id);
    return { ...role, permissions: perms, type_permissions: typePerms };
  });
  res.json(rolesWithData);
});

router.put("/roles/:id/permissions", requirePermission("manage_roles"), (req, res) => {
  const { permission_ids } = req.body;
  const roleId = req.params.id;
  try {
    const transaction = db.transaction(() => {
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

router.put("/roles/:id/type-permissions/:type_id", requirePermission("manage_roles"), (req, res) => {
  const { can_view, can_create, can_edit, can_delete } = req.body;
  const { id: roleId, type_id: typeId } = req.params;
  try {
    db.prepare(`
      UPDATE role_type_permissions SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ? 
      WHERE role_id = ? AND type_id = ?
    `).run(can_view ? 1 : 0, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0, roleId, typeId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
