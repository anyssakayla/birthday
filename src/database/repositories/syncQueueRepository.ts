import { nanoid } from 'nanoid/non-secure';
import { database } from '../db';
import { SyncQueueItem } from '../../types';

export class SyncQueueRepository {
  private get db() {
    return database.getDb();
  }
  
  async add(
    operation: 'create' | 'update' | 'delete',
    tableName: string,
    recordId: string,
    data: any
  ): Promise<void> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO sync_queue (id, operation, table_name, record_id, data, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      operation,
      tableName,
      recordId,
      JSON.stringify(data),
      now
    );
  }
  
  async getAll(): Promise<SyncQueueItem[]> {
    const results = await this.db.getAllAsync<SyncQueueItem>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );
    return results || [];
  }
  
  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
  }
  
  async clear(): Promise<void> {
    await this.db.runAsync('DELETE FROM sync_queue');
  }
  
  async updateError(id: string, error: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE sync_queue 
       SET retry_count = retry_count + 1, last_error = ? 
       WHERE id = ?`,
      error,
      id
    );
  }
  
  async getPendingCount(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue'
    );
    return result?.count || 0;
  }
}

// Singleton instance
export const syncQueueRepository = new SyncQueueRepository();