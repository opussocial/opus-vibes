import { db } from "../db";

export interface Task {
  id: number;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export class QueueService {
  async enqueue(type: string, payload: any, priority: number = 0): Promise<number> {
    const result = db.prepare(`
      INSERT INTO tasks (type, payload, priority) 
      VALUES (?, ?, ?)
    `).run(type, JSON.stringify(payload), priority);
    return result.lastInsertRowid as number;
  }

  async getTasks(limit: number = 50): Promise<Task[]> {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?").all(limit) as any[];
    return tasks.map(t => ({
      ...t,
      payload: t.payload ? JSON.parse(t.payload) : null
    }));
  }

  async pickNextTask(): Promise<Task | null> {
    // Atomic pick using a transaction
    const transaction = db.transaction(() => {
      const task = db.prepare(`
        SELECT * FROM tasks 
        WHERE status = 'pending' 
        OR (status = 'failed' AND attempts < max_attempts)
        ORDER BY priority DESC, created_at ASC 
        LIMIT 1
      `).get() as any;

      if (!task) return null;

      db.prepare(`
        UPDATE tasks 
        SET status = 'processing', 
            started_at = CURRENT_TIMESTAMP,
            attempts = attempts + 1
        WHERE id = ?
      `).run(task.id);

      return {
        ...task,
        payload: task.payload ? JSON.parse(task.payload) : null
      };
    });

    return transaction();
  }

  async completeTask(id: number): Promise<void> {
    db.prepare(`
      UPDATE tasks 
      SET status = 'completed', 
          completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  async failTask(id: number, error: string): Promise<void> {
    db.prepare(`
      UPDATE tasks 
      SET status = 'failed', 
          error = ? 
      WHERE id = ?
    `).run(error, id);
  }

  async clearTasks(): Promise<void> {
    db.prepare("DELETE FROM tasks WHERE status IN ('completed', 'failed')").run();
  }
}
