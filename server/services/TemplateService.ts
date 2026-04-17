import { db } from "../db";
import { Element, ElementType } from "../../src/types";

export class TemplateService {
  async getElementBySlug(slug: string): Promise<any> {
    const element = db.prepare("SELECT * FROM elements WHERE slug = ?").get(slug) as any;
    if (!element) return null;

    // Fetch modular data
    const type = db.prepare("SELECT * FROM element_types WHERE id = ?").get(element.type_id) as ElementType;
    const props = db.prepare("SELECT table_name FROM properties WHERE type_id = ?").all(element.type_id) as { table_name: string }[];
    
    const modularData: any = {};
    for (const prop of props) {
      const data = db.prepare(`SELECT * FROM ${prop.table_name} WHERE element_id = ?`).get(element.id);
      modularData[prop.table_name] = data || {};
    }

    // Fetch parent
    let parent = null;
    if (element.parent_id) {
      parent = db.prepare("SELECT id, name, slug, type_id FROM elements WHERE id = ?").get(element.parent_id);
    }

    // Fetch children
    const children = db.prepare("SELECT id, name, slug, type_id FROM elements WHERE parent_id = ?").all(element.id);

    // Fetch neighbors (related elements)
    const neighbors = await this.getRelatedElements(element.id);

    return { 
      ...element, 
      ...modularData, 
      type_name: type.name,
      type_slug: type.slug,
      parent,
      children,
      neighbors
    };
  }

  async getChildren(parentId: number): Promise<any[]> {
    const children = db.prepare("SELECT * FROM elements WHERE parent_id = ?").all(parentId) as any[];
    return children;
  }

  async getElementsByType(typeSlug: string): Promise<any[]> {
    const type = db.prepare("SELECT id FROM element_types WHERE slug = ?").get(typeSlug) as { id: number };
    if (!type) return [];
    return db.prepare("SELECT * FROM elements WHERE type_id = ?").all(type.id);
  }

  async getRelatedElements(elementId: number, relTypeName?: string): Promise<any[]> {
    let query = `
      SELECT e.*, r.name as rel_name 
      FROM elements e
      JOIN graph_edges ge ON e.id = ge.target_el_id
      JOIN graph_relationship_types r ON ge.rel_type_id = r.id
      WHERE ge.source_el_id = ?
    `;
    const params: any[] = [elementId];

    if (relTypeName) {
      query += " AND r.name = ?";
      params.push(relTypeName);
    }

    return db.prepare(query).all(...params);
  }
}

export const templateService = new TemplateService();
