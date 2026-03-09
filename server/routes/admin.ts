import express from "express";
import { requirePermission } from "../middleware";
import { adminService } from "../services";
import { validate, updateUserRoleSchema, createRoleSchema, rolePermissionsSchema, roleTypePermissionsSchema } from "../validation";

const router = express.Router();

router.get("/permissions", requirePermission("manage_roles"), async (req, res) => {
  try {
    const perms = await adminService.getPermissions();
    res.json(perms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", requirePermission("manage_roles"), async (req, res) => {
  try {
    const users = await adminService.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/users/:id/role", requirePermission("manage_roles"), validate(updateUserRoleSchema), async (req, res) => {
  const { role_id } = req.body;
  try {
    await adminService.updateUserRole(parseInt(req.params.id), role_id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/roles", requirePermission("manage_roles"), async (req, res) => {
  try {
    const roles = await adminService.getRoles();
    res.json(roles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/roles", requirePermission("manage_roles"), validate(createRoleSchema), async (req, res) => {
  const { name, description } = req.body;
  try {
    const id = await adminService.createRole({ name, description });
    res.json({ id, name, description });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/roles/:idOrSlug/permissions", requirePermission("manage_roles"), validate(rolePermissionsSchema), async (req, res) => {
  const { permission_ids } = req.body;
  const { idOrSlug } = req.params;
  try {
    await adminService.updateRolePermissions(idOrSlug, permission_ids);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/roles/:idOrSlug/type-permissions/:typeIdOrSlug", requirePermission("manage_roles"), validate(roleTypePermissionsSchema), async (req, res) => {
  const { idOrSlug, typeIdOrSlug } = req.params;
  try {
    await adminService.updateRoleTypePermissions(idOrSlug, typeIdOrSlug, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
