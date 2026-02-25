import express from "express";
import { db } from "../db";
import { requireAuth, checkTypePermission } from "../middleware";

const router = express.Router();

router.get("/elements", requireAuth, (req: any, res) => {
  const user = req.user;
  const allowedTypeIds = user.type_permissions.filter((p: any) => p.can_view).map((p: any) => p.type_id);
  if (allowedTypeIds.length === 0) return res.json([]);

  const placeholders = allowedTypeIds.map(() => "?").join(",");
  const elements = db.prepare(`
    SELECT e.*, t.name as type_name 
    FROM elements e 
    JOIN element_types t ON e.type_id = t.id
    WHERE e.type_id IN (${placeholders})
    ORDER BY e.updated_at DESC
  `).all(...allowedTypeIds);
  res.json(elements);
});

router.get("/elements/:id", requireAuth, checkTypePermission("can_view"), (req, res) => {
  const element = db.prepare(`
    SELECT e.*, t.name as type_name 
    FROM elements e 
    JOIN element_types t ON e.type_id = t.id
    WHERE e.id = ?
  `).get(req.params.id) as any;

  if (!element) return res.status(404).json({ error: "Element not found" });

  const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
  const data: any = { ...element };

  for (const prop of props) {
    const tableData = db.prepare(`SELECT * FROM ${prop.table_name} WHERE element_id = ?`).get(element.id);
    data[prop.table_name] = tableData || {};
  }
  res.json(data);
});

router.post("/elements", requireAuth, checkTypePermission("can_create"), (req, res) => {
  const { name, type_id, parent_id, modular_data } = req.body;
  try {
    const transaction = db.transaction(() => {
      const elementId = db.prepare("INSERT INTO elements (name, type_id, parent_id) VALUES (?, ?, ?)").run(name, type_id, parent_id).lastInsertRowid;
      const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(type_id) as any[];
      for (const prop of props) {
        const table = prop.table_name;
        const fields = modular_data[table] || {};
        const keys = Object.keys(fields);
        if (keys.length > 0) {
          const columns = ["element_id", ...keys].join(", ");
          const placeholders = ["?", ...keys.map(() => "?")].join(", ");
          const values = [elementId, ...keys.map(k => fields[k])];
          db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...values);
        } else {
          db.prepare(`INSERT INTO ${table} (element_id) VALUES (?)`).run(elementId);
        }
      }
      return elementId;
    });
    const id = transaction();
    res.json({ id, name, type_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/elements/:id", requireAuth, checkTypePermission("can_edit"), (req, res) => {
  const { name, parent_id, modular_data } = req.body;
  const elementId = req.params.id;
  try {
    const transaction = db.transaction(() => {
      db.prepare("UPDATE elements SET name = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, parent_id, elementId);
      const element = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(elementId) as any;
      const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
      for (const prop of props) {
        const table = prop.table_name;
        const fields = modular_data[table] || {};
        const keys = Object.keys(fields);
        if (keys.length > 0) {
          const setClause = keys.map(k => `${k} = ?`).join(", ");
          const values = [...keys.map(k => fields[k]), elementId];
          db.prepare(`UPDATE ${table} SET ${setClause} WHERE element_id = ?`).run(...values);
        }
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/elements/:id", requireAuth, checkTypePermission("can_delete"), (req, res) => {
  try {
    db.prepare("DELETE FROM elements WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Graph Edges
router.get("/graph", requireAuth, (req, res) => {
  const edges = db.prepare(`
    SELECT ge.*, grt.name as rel_name, se.name as source_name, te.name as target_name
    FROM graph_edges ge
    JOIN graph_relationship_types grt ON ge.rel_type_id = grt.id
    JOIN elements se ON ge.source_el_id = se.id
    JOIN elements te ON ge.target_el_id = te.id
  `).all();
  res.json(edges);
});

router.post("/graph", requireAuth, (req: any, res) => {
  const { rel_type_id, source_el_id, target_el_id } = req.body;
  const se = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(source_el_id) as any;
  const te = db.prepare("SELECT type_id FROM elements WHERE id = ?").get(target_el_id) as any;
  if (!se || !te) return res.status(404).json({ error: "Elements not found" });
  
  const user = req.user;
  const sPerm = user.type_permissions.find((p: any) => p.type_id === se.type_id);
  const tPerm = user.type_permissions.find((p: any) => p.type_id === te.type_id);
  if (!sPerm?.can_edit || !tPerm?.can_edit) return res.status(403).json({ error: "Permission denied to link these elements" });

  try {
    const result = db.prepare("INSERT INTO graph_edges (rel_type_id, source_el_id, target_el_id) VALUES (?, ?, ?)").run(rel_type_id, source_el_id, target_el_id);
    res.json({ id: result.lastInsertRowid, rel_type_id, source_el_id, target_el_id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/graph/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM graph_edges WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
