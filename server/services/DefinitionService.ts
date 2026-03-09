import { db } from "../db";
import { slugify } from "../utils";

export interface AppDefinition {
  metadata: {
    exported_at: string;
    version: string;
  };
  element_types: any[];
  roles: any[];
  relationship_types: any[];
}

export class DefinitionService {
  async exportDefinition(): Promise<AppDefinition> {
    const element_types = (db.prepare("SELECT * FROM element_types").all() as any[]).map(type => {
      const properties = db.prepare("SELECT table_name, label FROM properties WHERE type_id = ?").all(type.id);
      const allowed_parents = db.prepare(`
        SELECT et.slug FROM type_hierarchy th
        JOIN element_types et ON th.parent_type_id = et.id
        WHERE th.child_type_id = ?
      `).all(type.id).map((p: any) => p.slug);
      
      return {
        slug: type.slug,
        name: type.name,
        description: type.description,
        statuses: type.statuses ? JSON.parse(type.statuses) : [],
        color: type.color,
        icon: type.icon,
        properties,
        allowed_parents
      };
    });

    const roles = (db.prepare("SELECT * FROM roles").all() as any[]).map(role => {
      const permissions = db.prepare(`
        SELECT p.name FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `).all(role.id).map((p: any) => p.name);

      const type_permissions = db.prepare(`
        SELECT rtp.*, et.slug as type_slug FROM role_type_permissions rtp
        JOIN element_types et ON rtp.type_id = et.id
        WHERE rtp.role_id = ?
      `).all(role.id).map((tp: any) => ({
        type_slug: tp.type_slug,
        can_view: tp.can_view,
        can_create: tp.can_create,
        can_edit: tp.can_edit,
        can_delete: tp.can_delete
      }));

      return {
        slug: role.slug,
        name: role.name,
        description: role.description,
        permissions,
        type_permissions
      };
    });

    const relationship_types = db.prepare(`
      SELECT grt.name, st.slug as source_slug, tt.slug as target_slug
      FROM graph_relationship_types grt
      JOIN element_types st ON grt.source_type_id = st.id
      JOIN element_types tt ON grt.target_type_id = tt.id
    `).all();

    return {
      metadata: {
        exported_at: new Date().toISOString(),
        version: "1.0.0"
      },
      element_types,
      roles,
      relationship_types
    };
  }

  async importDefinition(def: AppDefinition): Promise<void> {
    const transaction = db.transaction(() => {
      // 1. Upsert Element Types
      for (const et of def.element_types) {
        const existing = db.prepare("SELECT id FROM element_types WHERE slug = ?").get(et.slug) as any;
        let typeId: number;
        
        if (existing) {
          typeId = existing.id;
          db.prepare("UPDATE element_types SET name = ?, description = ?, statuses = ?, color = ?, icon = ? WHERE id = ?")
            .run(et.name, et.description, JSON.stringify(et.statuses), et.color, et.icon, typeId);
        } else {
          typeId = db.prepare("INSERT INTO element_types (name, slug, description, statuses, color, icon) VALUES (?, ?, ?, ?, ?, ?)")
            .run(et.name, et.slug, et.description, JSON.stringify(et.statuses), et.color, et.icon).lastInsertRowid as number;
        }

        // Sync properties (only if no elements exist to avoid corruption, or just overwrite if it's a "definition" sync)
        // For simplicity in this requirement, we overwrite properties
        db.prepare("DELETE FROM properties WHERE type_id = ?").run(typeId);
        const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
        for (const prop of et.properties) {
          insertProp.run(typeId, prop.table_name, prop.label);
        }
      }

      // 2. Upsert Roles
      for (const role of def.roles) {
        const existing = db.prepare("SELECT id FROM roles WHERE slug = ?").get(role.slug) as any;
        let roleId: number;

        if (existing) {
          roleId = existing.id;
          db.prepare("UPDATE roles SET name = ?, description = ? WHERE id = ?")
            .run(role.name, role.description, roleId);
        } else {
          roleId = db.prepare("INSERT INTO roles (name, slug, description) VALUES (?, ?, ?)")
            .run(role.name, role.slug, role.description).lastInsertRowid as number;
        }

        // Sync permissions
        db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(roleId);
        const insertPerm = db.prepare("INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions WHERE name = ?");
        for (const pName of role.permissions) {
          insertPerm.run(roleId, pName);
        }

        // Sync type permissions
        db.prepare("DELETE FROM role_type_permissions WHERE role_id = ?").run(roleId);
        const insertTypePerm = db.prepare(`
          INSERT INTO role_type_permissions (role_id, type_id, can_view, can_create, can_edit, can_delete)
          SELECT ?, id, ?, ?, ?, ? FROM element_types WHERE slug = ?
        `);
        for (const tp of role.type_permissions) {
          insertTypePerm.run(roleId, tp.can_view, tp.can_create, tp.can_edit, tp.can_delete, tp.type_slug);
        }
      }

      // 3. Upsert Relationship Types
      // Clear existing first or match by name/source/target? 
      // Slugs are better but relationships don't have slugs in this schema.
      // We'll clear and recreate for simplicity in "definition" sync.
      db.prepare("DELETE FROM graph_relationship_types").run();
      const insertRel = db.prepare(`
        INSERT INTO graph_relationship_types (source_type_id, target_type_id, name)
        SELECT st.id, tt.id, ? 
        FROM element_types st, element_types tt
        WHERE st.slug = ? AND tt.slug = ?
      `);
      for (const rel of def.relationship_types) {
        insertRel.run(rel.name, rel.source_slug, rel.target_slug);
      }

      // 4. Upsert Type Hierarchy
      db.prepare("DELETE FROM type_hierarchy").run();
      const insertHierarchy = db.prepare(`
        INSERT INTO type_hierarchy (parent_type_id, child_type_id)
        SELECT pt.id, ct.id
        FROM element_types pt, element_types ct
        WHERE pt.slug = ? AND ct.slug = ?
      `);
      for (const et of def.element_types) {
        for (const pSlug of et.allowed_parents) {
          insertHierarchy.run(pSlug, et.slug);
        }
      }
    });

    transaction();
  }
}
