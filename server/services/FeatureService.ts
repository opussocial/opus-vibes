import { db } from "../db";

export class FeatureService {
  isFeatureEnabled(name: string): boolean {
    try {
      const row = db.prepare("SELECT enabled FROM feature_switches WHERE name = ?").get(name) as { enabled: number } | undefined;
      return row ? row.enabled === 1 : false;
    } catch (err) {
      // Fail silently as requested
      return false;
    }
  }

  async setFeatureEnabled(name: string, enabled: boolean): Promise<void> {
    db.prepare(`
      INSERT INTO feature_switches (name, enabled)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET enabled = excluded.enabled
    `).run(name, enabled ? 1 : 0);
  }

  async getAllFeatures(): Promise<Record<string, boolean>> {
    const rows = db.prepare("SELECT * FROM feature_switches").all() as { name: string, enabled: number }[];
    const features: Record<string, boolean> = {};
    rows.forEach(row => {
      features[row.name] = row.enabled === 1;
    });
    return features;
  }
}

export const featureService = new FeatureService();
