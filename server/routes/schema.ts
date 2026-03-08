import express from "express";
import { db } from "../db";
import { requireAuth, requirePermission } from "../middleware";
import { slugify } from "../utils";

const router = express.Router();

router.get("/types", requireAuth, (req, res) => {
  const types = db.prepare("SELECT * FROM element_types").all();
  const typesWithProps = types.map((type: any) => {
    const props = db.prepare("SELECT * FROM properties WHERE type_id = ?").all(type.id);
    const allowedParents = db.prepare("SELECT parent_type_id FROM type_hierarchy WHERE child_type_id = ?").all(type.id);
    const elementCount = db.prepare("SELECT COUNT(*) as count FROM elements WHERE type_id = ?").get(type.id) as { count: number };
    return { 
      ...type, 
      properties: props, 
      allowed_parent_types: allowedParents.map((p: any) => p.parent_type_id),
      element_count: elementCount.count
    };
  });
  res.json(typesWithProps);
});

router.post("/types", requirePermission("manage_types"), (req, res) => {
  const { name, description, properties, allowed_parent_types } = req.body;
  const slug = slugify(name);
  try {
    const transaction = db.transaction(() => {
      const typeId = db.prepare("INSERT INTO element_types (name, slug, description) VALUES (?, ?, ?)").run(name, slug, description).lastInsertRowid;
      const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
      for (const prop of properties) {
        insertProp.run(typeId, prop.table_name, prop.label);
      }

      if (allowed_parent_types && Array.isArray(allowed_parent_types)) {
        // Circular dependency check (though less likely for a new type, it could still happen if it references itself)
        for (const parentId of allowed_parent_types) {
          if (parentId === typeId) {
            throw new Error("A type cannot be its own parent.");
          }
        }

        const insertHierarchy = db.prepare("INSERT INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)");
        for (const parentId of allowed_parent_types) {
          insertHierarchy.run(parentId, typeId);
        }
      }

      const adminRole = db.prepare("SELECT id FROM roles WHERE name = 'Super Admin'").get() as any;
      if (adminRole) {
        db.prepare("INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)").run(adminRole.id, typeId);
      }
      return typeId;
    });
    const id = transaction();
    res.json({ id, name, description, properties, allowed_parent_types });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/types/:idOrSlug", requirePermission("manage_types"), (req, res) => {
  const { idOrSlug } = req.params;
  const { name, description, properties, allowed_parent_types } = req.body;
  const isId = /^\d+$/.test(idOrSlug);

  try {
    const type = db.prepare(`SELECT * FROM element_types WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    if (!type) return res.status(404).json({ error: "Type not found" });

    const elementCount = db.prepare("SELECT COUNT(*) as count FROM elements WHERE type_id = ?").get(type.id) as { count: number };
    const hasElements = elementCount.count > 0;

    if (hasElements) {
      // If elements exist, check if properties are being changed
      const currentProps = db.prepare("SELECT table_name, label FROM properties WHERE type_id = ?").all(type.id) as any[];
      const propsChanged = properties.length !== currentProps.length || 
        properties.some((p: any) => !currentProps.find(cp => cp.table_name === p.table_name));
      
      if (propsChanged) {
        return res.status(400).json({ error: "Cannot change modular properties because elements of this type already exist." });
      }
    }

    const transaction = db.transaction(() => {
      db.prepare("UPDATE element_types SET name = ?, slug = ?, description = ? WHERE id = ?").run(name, slugify(name), description, type.id);
      
      // Update properties - only if they haven't changed or if no elements exist
      if (!hasElements) {
        db.prepare("DELETE FROM properties WHERE type_id = ?").run(type.id);
        const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
        for (const prop of properties) {
          insertProp.run(type.id, prop.table_name, prop.label);
        }
      }

      // Update hierarchy
      if (allowed_parent_types && Array.isArray(allowed_parent_types)) {
        // Circular dependency check
        const checkCycle = (targetId: number, potentialParentId: number): boolean => {
          if (targetId === potentialParentId) return true;
          const parents = db.prepare("SELECT parent_type_id FROM type_hierarchy WHERE child_type_id = ?").all(potentialParentId) as any[];
          for (const p of parents) {
            if (p.parent_type_id === targetId || checkCycle(targetId, p.parent_type_id)) return true;
          }
          return false;
        };

        for (const parentId of allowed_parent_types) {
          if (checkCycle(type.id, parentId)) {
            throw new Error(`Circular dependency detected: Type ${parentId} is already a descendant of this type.`);
          }
        }

        db.prepare("DELETE FROM type_hierarchy WHERE child_type_id = ?").run(type.id);
        const insertHierarchy = db.prepare("INSERT INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)");
        for (const parentId of allowed_parent_types) {
          insertHierarchy.run(parentId, type.id);
        }
      } else {
        db.prepare("DELETE FROM type_hierarchy WHERE child_type_id = ?").run(type.id);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/types/:idOrSlug", requirePermission("manage_types"), (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    if (isId) {
      db.prepare("DELETE FROM element_types WHERE id = ?").run(idOrSlug);
    } else {
      db.prepare("DELETE FROM element_types WHERE slug = ?").run(idOrSlug);
    }
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
