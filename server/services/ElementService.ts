import { db } from "../db";
import { slugify } from "../utils";
import { IElementService } from "./interfaces";
import { Element, GraphEdge } from "../../src/types";

export class ElementService implements IElementService {
  async getElements(allowedTypeIds: number[], userId?: number, canViewAll: boolean = false): Promise<Element[]> {
    if (!canViewAll && allowedTypeIds.length === 0) return [];
    
    let query = `
      SELECT e.*, t.name as type_name, t.slug as type_slug 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
    `;
    
    const params: any[] = [];
    
    if (!canViewAll) {
      const placeholders = allowedTypeIds.map(() => "?").join(",");
      query += ` WHERE e.type_id IN (${placeholders})`;
      params.push(...allowedTypeIds);
      
      if (userId) {
        query += ` AND (e.user_id = ? OR e.user_id IS NULL)`;
        params.push(userId);
      }
    }
    
    query += ` ORDER BY e.updated_at DESC`;
    
    return db.prepare(query).all(...params) as Element[];
  }

  async getRootElements(allowedTypeIds: number[], userId?: number, canViewAll: boolean = false): Promise<Element[]> {
    if (!canViewAll && allowedTypeIds.length === 0) return [];
    
    let query = `
      SELECT e.*, t.name as type_name, t.slug as type_slug 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.parent_id IS NULL
    `;
    
    const params: any[] = [];
    
    if (!canViewAll) {
      const placeholders = allowedTypeIds.map(() => "?").join(",");
      query += ` AND e.type_id IN (${placeholders})`;
      params.push(...allowedTypeIds);
      
      if (userId) {
        query += ` AND (e.user_id = ? OR e.user_id IS NULL)`;
        params.push(userId);
      }
    }
    
    query += ` ORDER BY e.name ASC`;
    
    return db.prepare(query).all(...params) as Element[];
  }

  async getElement(idOrSlug: string, userId?: number, canViewAll: boolean = false): Promise<any> {
    const isId = /^\d+$/.test(idOrSlug);
    let query = `
      SELECT e.*, t.name as type_name, t.slug as type_slug 
      FROM elements e 
      JOIN element_types t ON e.type_id = t.id
      WHERE e.${isId ? "id" : "slug"} = ?
    `;
    const params: any[] = [idOrSlug];

    if (!canViewAll && userId) {
      query += ` AND (e.user_id = ? OR e.user_id IS NULL)`;
      params.push(userId);
    }

    const element = db.prepare(query).get(...params) as any;

    if (!element) return null;

    const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as any[];
    const data: any = { ...element };

    for (const prop of props) {
      const tableData = db.prepare(`SELECT * FROM ${prop.table_name} WHERE element_id = ?`).get(element.id);
      data[prop.table_name] = tableData || {};
    }

    // Include interactions
    data.interactions = db.prepare(`
      SELECT i.*, it.name as type_name, it.icon as type_icon, u.username
      FROM interactions i
      JOIN interaction_types it ON i.type_id = it.id
      JOIN users u ON i.user_id = u.id
      WHERE i.element_id = ?
      ORDER BY i.created_at DESC
    `).all(element.id);

    // Include graph edges (relationships/tags)
    data.graph = db.prepare(`
      SELECT ge.*, grt.name as rel_name, se.name as source_name, se.slug as source_slug, te.name as target_name, te.slug as target_slug
      FROM graph_edges ge
      JOIN graph_relationship_types grt ON ge.rel_type_id = grt.id
      JOIN elements se ON ge.source_el_id = se.id
      JOIN elements te ON ge.target_el_id = te.id
      WHERE ge.source_el_id = ? OR ge.target_el_id = ?
    `).all(element.id, element.id);

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

  async createElement(data: { name: string, type_id: number, parent_id: number | null, status?: string, modular_data: any }, userId?: number): Promise<number> {
    const { name, type_id, parent_id, status, modular_data } = data;
    const baseSlug = slugify(name);
    
    const transaction = db.transaction(() => {
      let slug = baseSlug;
      let counter = 1;
      while (db.prepare("SELECT id FROM elements WHERE slug = ?").get(slug)) {
        slug = `${baseSlug}-${counter++}`;
      }

      const elementId = db.prepare("INSERT INTO elements (name, slug, type_id, user_id, parent_id, status) VALUES (?, ?, ?, ?, ?, ?)").run(name, slug, type_id, userId || null, parent_id, status || null).lastInsertRowid as number;
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

  async updateElement(idOrSlug: string, data: { name: string, parent_id: number | null, status?: string, modular_data: any }, userId?: number, canViewAll: boolean = false): Promise<void> {
    const { name, parent_id, status, modular_data } = data;
    const isId = /^\d+$/.test(idOrSlug);
    
    const transaction = db.transaction(() => {
      let query = `SELECT id, type_id FROM elements WHERE ${isId ? "id" : "slug"} = ?`;
      const params: any[] = [idOrSlug];
      
      if (!canViewAll && userId) {
        query += ` AND (user_id = ? OR user_id IS NULL)`;
        params.push(userId);
      }
      
      const element = db.prepare(query).get(...params) as any;
      if (!element) throw new Error("Element not found or permission denied");
      const elementId = element.id;

      db.prepare("UPDATE elements SET name = ?, parent_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, parent_id, status || null, elementId);
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

  async deleteElement(idOrSlug: string, userId?: number, canViewAll: boolean = false): Promise<void> {
    const isId = /^\d+$/.test(idOrSlug);
    let query = `SELECT id FROM elements WHERE ${isId ? "id" : "slug"} = ?`;
    const params: any[] = [idOrSlug];
    
    if (!canViewAll && userId) {
      query += ` AND (user_id = ? OR user_id IS NULL)`;
      params.push(userId);
    }
    
    const element = db.prepare(query).get(...params) as any;
    if (!element) throw new Error("Element not found or permission denied");
    
    db.prepare("DELETE FROM elements WHERE id = ?").run(element.id);
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
