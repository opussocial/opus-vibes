import { db } from "../db";
import { IInteractionService } from "./interfaces";
import { Interaction, InteractionType } from "../../src/types";

export class InteractionService implements IInteractionService {
  async getInteractions(elementIdOrSlug: string): Promise<Interaction[]> {
    const isId = /^\d+$/.test(elementIdOrSlug);
    const element = db.prepare(`SELECT id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(elementIdOrSlug) as any;
    if (!element) throw new Error("Element not found");

    return db.prepare(`
      SELECT i.*, u.username, it.name as type_name, it.icon as type_icon
      FROM interactions i
      JOIN users u ON i.user_id = u.id
      JOIN interaction_types it ON i.type_id = it.id
      WHERE i.element_id = ?
      ORDER BY i.created_at DESC
    `).all(element.id) as Interaction[];
  }

  async createInteraction(elementIdOrSlug: string, userId: number, data: { type_id: number, content: string }): Promise<number> {
    const { type_id, content } = data;
    const isId = /^\d+$/.test(elementIdOrSlug);
    const element = db.prepare(`SELECT id FROM elements WHERE ${isId ? "id" : "slug"} = ?`).get(elementIdOrSlug) as any;
    if (!element) throw new Error("Element not found");

    const type = db.prepare("SELECT name FROM interaction_types WHERE id = ?").get(type_id) as any;
    if (type && (type.name === 'like' || type.name === 'favorite')) {
      const existing = db.prepare("SELECT id FROM interactions WHERE element_id = ? AND user_id = ? AND type_id = ?").get(element.id, userId, type_id);
      if (existing) throw new Error(`Already ${type.name}d this element`);
    }

    const result = db.prepare("INSERT INTO interactions (element_id, user_id, type_id, content) VALUES (?, ?, ?, ?)").run(element.id, userId, type_id, content);
    return result.lastInsertRowid as number;
  }

  async deleteInteraction(id: number, userId: number, isAdmin: boolean): Promise<void> {
    const interaction = db.prepare("SELECT user_id FROM interactions WHERE id = ?").get(id) as any;
    if (!interaction) throw new Error("Interaction not found");
    if (interaction.user_id !== userId && !isAdmin) {
      throw new Error("Unauthorized to delete this interaction");
    }
    db.prepare("DELETE FROM interactions WHERE id = ?").run(id);
  }

  async getInteractionTypes(): Promise<InteractionType[]> {
    return db.prepare("SELECT * FROM interaction_types").all() as InteractionType[];
  }
}
