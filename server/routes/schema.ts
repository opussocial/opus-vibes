import express from "express";
import { db } from "../db";
import { requireAuth, requirePermission } from "../middleware";

const router = express.Router();

router.get("/types", requireAuth, (req, res) => {
  const types = db.prepare("SELECT * FROM element_types").all();
  const typesWithProps = types.map((type: any) => {
    const props = db.prepare("SELECT * FROM properties WHERE type_id = ?").all(type.id);
    return { ...type, properties: props };
  });
  res.json(typesWithProps);
});

router.post("/types", requirePermission("manage_types"), (req, res) => {
  const { name, description, properties } = req.body;
  try {
    const transaction = db.transaction(() => {
      const typeId = db.prepare("INSERT INTO element_types (name, description) VALUES (?, ?)").run(name, description).lastInsertRowid;
      const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
      for (const prop of properties) {
        insertProp.run(typeId, prop.table_name, prop.label);
      }
      const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'Super Admin'").get() as any;
      if (adminRole) {
        db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)").run(adminRole.id, typeId);
      }
      return typeId;
    });
    const id = transaction();
    res.json({ id, name, description, properties });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/types/:id", requirePermission("manage_types"), (req, res) => {
  try {
    db.prepare("DELETE FROM element_types WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/relationship-types", requireAuth, (req, res) => {
  const types = db.prepare(`
    SELECT grt.*, st.name as source_type_name, tt.name as target_type_name 
    FROM graph_relationship_types grt
    JOIN element_types st ON grt.source_type_id = st.id
    JOIN element_types tt ON grt.target_type_id = tt.id
  `).all();
  res.json(types);
});

router.post("/relationship-types", requirePermission("manage_types"), (req, res) => {
  const { source_type_id, target_type_id, name } = req.body;
  try {
    const result = db.prepare("INSERT INTO graph_relationship_types (source_type_id, target_type_id, name) VALUES (?, ?, ?)").run(source_type_id, target_type_id, name);
    res.json({ id: result.lastInsertRowid, source_type_id, target_type_id, name });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/relationship-types/:id", requirePermission("manage_types"), (req, res) => {
  db.prepare("DELETE FROM graph_relationship_types WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
