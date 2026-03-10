import { db } from "../db";
import { slugify } from "../utils";
import { ISchemaService } from "./interfaces";
import { ElementType, RelationshipType } from "../../src/types";
import { configService } from "./index";

export class SchemaService implements ISchemaService {
  async getTypes(): Promise<ElementType[]> {
    const types = db.prepare("SELECT * FROM element_types").all() as any[];
    return types.map((type: any) => {
      const props = db.prepare("SELECT * FROM properties WHERE type_id = ?").all(type.id);
      const allowedParents = db.prepare("SELECT parent_type_id FROM type_hierarchy WHERE child_type_id = ?").all(type.id);
      const elementCount = db.prepare("SELECT COUNT(*) as count FROM elements WHERE type_id = ?").get(type.id) as { count: number };
      return { 
        ...type, 
        statuses: type.statuses ? JSON.parse(type.statuses) : [],
        properties: props, 
        allowed_parent_types: allowedParents.map((p: any) => p.parent_type_id),
        element_count: elementCount.count,
        settings: type.settings ? JSON.parse(type.settings) : {}
      };
    });
  }

  async createType(data: { name: string, description: string, statuses?: string[], color?: string, icon?: string, properties: any[], allowed_parent_types?: number[], settings?: any }): Promise<number> {
    const { name, description, statuses, color, icon, properties, allowed_parent_types, settings } = data;
    const slug = slugify(name);
    
    const transaction = db.transaction(() => {
      const typeId = db.prepare("INSERT INTO element_types (name, slug, description, statuses, color, icon, settings) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, slug, description, statuses ? JSON.stringify(statuses) : null, color || "#6366f1", icon || "Package", settings ? JSON.stringify(settings) : "{}").lastInsertRowid as number;
      const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
      for (const prop of properties) {
        insertProp.run(typeId, prop.table_name, prop.label);
      }

      if (allowed_parent_types && Array.isArray(allowed_parent_types)) {
        for (const parentId of allowed_parent_types) {
          if (parentId === typeId) throw new Error("A type cannot be its own parent.");
        }
        const insertHierarchy = db.prepare("INSERT INTO type_hierarchy (parent_type_id, child_type_id) VALUES (?, ?)");
        for (const parentId of allowed_parent_types) {
          insertHierarchy.run(parentId, typeId);
        }
      }

      return typeId;
    });
    
    return transaction();
  }

  async updateType(idOrSlug: string, data: { name: string, description: string, statuses?: string[], color?: string, icon?: string, properties: any[], allowed_parent_types?: number[], settings?: any }): Promise<void> {
    const { name, description, statuses, color, icon, properties, allowed_parent_types, settings } = data;
    const isId = /^\d+$/.test(idOrSlug);

    const type = db.prepare(`SELECT * FROM element_types WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    if (!type) throw new Error("Type not found");

    const elementCount = db.prepare("SELECT COUNT(*) as count FROM elements WHERE type_id = ?").get(type.id) as { count: number };
    const hasElements = elementCount.count > 0;

    if (hasElements) {
      const currentProps = db.prepare("SELECT table_name, label FROM properties WHERE type_id = ?").all(type.id) as any[];
      const propsChanged = properties.length !== currentProps.length || 
        properties.some((p: any) => !currentProps.find(cp => cp.table_name === p.table_name));
      
      if (propsChanged) {
        throw new Error("Cannot change modular properties because elements of this type already exist.");
      }
    }

    const allowCircular = await configService.getConfigValue("allow_circular_dependency") === true;

    const transaction = db.transaction(() => {
      db.prepare("UPDATE element_types SET name = ?, slug = ?, description = ?, statuses = ?, color = ?, icon = ?, settings = ? WHERE id = ?").run(name, slugify(name), description, statuses ? JSON.stringify(statuses) : null, color || "#6366f1", icon || "Package", settings ? JSON.stringify(settings) : "{}", type.id);
      
      if (!hasElements) {
        db.prepare("DELETE FROM properties WHERE type_id = ?").run(type.id);
        const insertProp = db.prepare("INSERT INTO properties (type_id, table_name, label) VALUES (?, ?, ?)");
        for (const prop of properties) {
          insertProp.run(type.id, prop.table_name, prop.label);
        }
      }

      if (allowed_parent_types && Array.isArray(allowed_parent_types)) {
        const checkCycle = (targetId: number, potentialParentId: number): boolean => {
          if (targetId === potentialParentId) return true;
          const parents = db.prepare("SELECT parent_type_id FROM type_hierarchy WHERE child_type_id = ?").all(potentialParentId) as any[];
          for (const p of parents) {
            if (p.parent_type_id === targetId || checkCycle(targetId, p.parent_type_id)) return true;
          }
          return false;
        };

        if (!allowCircular) {
          for (const parentId of allowed_parent_types) {
            if (checkCycle(type.id, parentId)) {
              throw new Error(`Circular dependency detected: Type ${parentId} is already a descendant of this type.`);
            }
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
  }

  async deleteType(idOrSlug: string): Promise<void> {
    const isId = /^\d+$/.test(idOrSlug);
    if (isId) {
      db.prepare("DELETE FROM element_types WHERE id = ?").run(idOrSlug);
    } else {
      db.prepare("DELETE FROM element_types WHERE slug = ?").run(idOrSlug);
    }
  }

  async getRelationshipTypes(): Promise<RelationshipType[]> {
    return db.prepare(`
      SELECT grt.*, st.name as source_type_name, tt.name as target_type_name 
      FROM graph_relationship_types grt
      JOIN element_types st ON grt.source_type_id = st.id
      JOIN element_types tt ON grt.target_type_id = tt.id
    `).all() as RelationshipType[];
  }

  async createRelationshipType(data: { source_type_id: number, target_type_id: number, name: string }): Promise<number> {
    const { source_type_id, target_type_id, name } = data;
    const result = db.prepare("INSERT INTO graph_relationship_types (source_type_id, target_type_id, name) VALUES (?, ?, ?)").run(source_type_id, target_type_id, name);
    return result.lastInsertRowid as number;
  }

  async deleteRelationshipType(id: number): Promise<void> {
    db.prepare("DELETE FROM graph_relationship_types WHERE id = ?").run(id);
  }
}
