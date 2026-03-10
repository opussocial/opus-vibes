import { db } from "../db";
import { SystemConfig } from "../../src/types";

export class ConfigService {
  async getConfig(): Promise<SystemConfig[]> {
    const rows = db.prepare("SELECT * FROM system_config").all() as any[];
    return rows.map(row => ({
      ...row,
      value: this.parseValue(row.value)
    }));
  }

  async getConfigValue(key: string): Promise<any> {
    const row = db.prepare("SELECT value FROM system_config WHERE key = ?").get(key) as any;
    return row ? this.parseValue(row.value) : null;
  }

  async updateConfig(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    db.prepare("INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, stringValue);
  }

  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
}
