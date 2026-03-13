import { db } from "../db";
import { ISettingsService } from "./interfaces";

export class SettingsService implements ISettingsService {
  async getSettings(filters: { type_id?: number, user_id?: number }): Promise<any> {
    const { type_id, user_id } = filters;
    let query = "SELECT key, value FROM settings WHERE 1=1";
    const params: any[] = [];

    if (type_id !== undefined) {
      query += " AND type_id = ?";
      params.push(type_id);
    } else {
      query += " AND type_id IS NULL";
    }

    if (user_id !== undefined) {
      query += " AND user_id = ?";
      params.push(user_id);
    } else {
      query += " AND user_id IS NULL";
    }

    const rows = db.prepare(query).all(...params) as any[];
    const settings: any = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    return settings;
  }

  async getSetting(key: string, filters: { type_id?: number, user_id?: number }): Promise<any> {
    const { type_id, user_id } = filters;
    let query = "SELECT value FROM settings WHERE key = ?";
    const params: any[] = [key];

    if (type_id !== undefined) {
      query += " AND type_id = ?";
      params.push(type_id);
    } else {
      query += " AND type_id IS NULL";
    }

    if (user_id !== undefined) {
      query += " AND user_id = ?";
      params.push(user_id);
    } else {
      query += " AND user_id IS NULL";
    }

    const row = db.prepare(query).get(...params) as any;
    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch (e) {
      return row.value;
    }
  }

  async updateSetting(key: string, value: any, filters: { type_id?: number, user_id?: number }): Promise<void> {
    const { type_id, user_id } = filters;
    const valueStr = JSON.stringify(value);

    db.prepare(`
      INSERT INTO settings (key, value, type_id, user_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key, type_id, user_id) DO UPDATE SET value = excluded.value
    `).run(key, valueStr, type_id || null, user_id || null);
  }

  async deleteSetting(key: string, filters: { type_id?: number, user_id?: number }): Promise<void> {
    const { type_id, user_id } = filters;
    let query = "DELETE FROM settings WHERE key = ?";
    const params: any[] = [key];

    if (type_id !== undefined) {
      query += " AND type_id = ?";
      params.push(type_id);
    } else {
      query += " AND type_id IS NULL";
    }

    if (user_id !== undefined) {
      query += " AND user_id = ?";
      params.push(user_id);
    } else {
      query += " AND user_id IS NULL";
    }

    db.prepare(query).run(...params);
  }
}
