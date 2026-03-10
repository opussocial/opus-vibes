import { db } from "../db";
import { slugify } from "../utils";
import { IElementService } from "./interfaces";
import { Element, GraphEdge } from "../../src/types";

export class ElementService implements IElementService {
  async getElements(allowedTypeIds: number[]): Promise<Element[]> {
    if (allowedTypeIds.length === 0) return [];
    const placeholders = allowedTypeIds.map(() => "?").join(",");
    return db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.type_id IN (${placeholders})
      ORDER BY e.updated_at DESC
    `).all(...allowedTypeIds) as Element[];
  }

  async getRootElements(allowedTypeIds: number[]): Promise<Element[]> {
    if (allowedTypeIds.length === 0) return [];
    const placeholders = allowedTypeIds.map(() => "?").join(",");
    return db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.type_id IN (${placeholders}) AND e.parent_id IS NULL
      ORDER BY e.name ASC
    `).all(...allowedTypeIds) as Element[];
  }

  async getElement(idOrSlug: string): Promise<any> {
    const isId = /^\d+$/.test(idOrSlug);
    const element = db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.${isId ? "id" : "slug"} = ?
    `).get(idOrSlug) as any;

    if (!element) return null;

    const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
    const data: any = { ...element };

    for (const prop of props) {
      const tableData = db.prepare(`SELECT * FROM ${prop.table_name} WHERE element_id = ?`).get(element.id);
      data[prop.table_name] = tableData || {};
    }
    return data;
  }

  async getChildren(idOrSlug: string): Promise<Element[]> {
    const isId = /^\d+$/.test(idOrSlug);
    const element = db.prepare(`SELECT id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    if (!element) throw new Error("Element not found");

    return db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.parent_id = ?
      ORDER BY e.name ASC
    `).all(element.id) as Element[];
  }

  async getParent(idOrSlug: string): Promise<Element | null> {
    const isId = /^\d+$/.test(idOrSlug);
    const element = db.prepare(`SELECT parent_id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    if (!element || !element.parent_id) return null;

    return db.prepare(`
      SELECT e.*, t.name as type_name 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.id = ?
    `).get(element.parent_id) as Element;
  }

  async getGraph(idOrSlug: string): Promise<GraphEdge[]> {
    const isId = /^\d+$/.test(idOrSlug);
    const element = db.prepare(`SELECT id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
    if (!element) throw new Error("Element not found");

    return db.prepare(`
      SELECT ge.*, grt.name as rel_name, se.name as source_name, te.name as target_name
      FROM graph_edges ge
      JOIN graph_relationship_types grt ON ge.rel_type_id = grt.id
      JOIN elements se ON ge.source_el_id = se.id
      JOIN elements te ON ge.target_el_id = te.id
      WHERE ge.source_el_id = ? OR ge.target_el_id = ?
    `).all(element.id, element.id) as GraphEdge[];
  }

  async createElement(data: { name: string, type_id: number, parent_id: number | null, modular_data: any }): Promise<number> {
    const { name, type_id, parent_id, modular_data } = data;
    const baseSlug = slugify(name);
    
    const transaction = db.transaction(() => {
      let slug = baseSlug;
      let counter = 1;
      while (db.prepare("SELECT id FROM elements WHERE slug = ?").get(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }

      const elementId = db.prepare("INSERT INTO elements (name, slug, type_id, parent_id) VALUES (?, ?, ?, ?)").run(name, slug, type_id, parent_id).lastInsertRowid as number;
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
    
    return transaction();
  }

  async updateElement(idOrSlug: string, data: { name: string, parent_id: number | null, modular_data: any }): Promise<void> {
    const { name, parent_id, modular_data } = data;
    const isId = /^\d+$/.test(idOrSlug);
    
    const transaction = db.transaction(() => {
      const element = db.prepare(`SELECT id, type_id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(idOrSlug) as any;
      if (!element) throw new Error("Element not found");
      const elementId = element.id;

      db.prepare("UPDATE elements SET name = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, parent_id, elementId);
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
  }

  async deleteElement(idOrSlug: string): Promise<void> {
    const isId = /^\d+$/.test(idOrSlug);
    db.prepare(`DELETE FROM elements WHERE ${isId ? "id" : "slug"} = ?`).run(idOrSlug);
  }

  async getAllGraphEdges(): Promise<GraphEdge[]> {
    return db.prepare(`
      SELECT ge.*, grt.name as rel_name, se.name as source_name, te.name as target_name
      FROM graph_edges ge
      JOIN graph_relationship_types grt ON ge.rel_type_id = grt.id
      JOIN elements se ON ge.source_el_id = se.id
      JOIN elements te ON ge.target_el_id = te.id
    `).all() as GraphEdge[];
  }

  async createGraphEdge(data: { rel_type_id: number, source_el_id: number, target_el_id: number }): Promise<number> {
    const { rel_type_id, source_el_id, target_el_id } = data;
    const result = db.prepare("INSERT INTO graph_edges (rel_type_id, source_el_id, target_el_id) VALUES (?, ?, ?)").run(rel_type_id, source_el_id, target_el_id);
    return result.lastInsertRowid as number;
  }

  async deleteGraphEdge(id: number): Promise<void> {
    db.prepare("DELETE FROM graph_edges WHERE id = ?").run(id);
  }
}
