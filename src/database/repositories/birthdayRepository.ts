import { nanoid } from 'nanoid/non-secure';
import { database } from '../db';
import { Birthday, BirthdayInput, DEFAULT_RELATIONSHIP_TYPE, DEFAULT_THEME_COLOR_ID } from '../../types';
import { syncQueueRepository } from './syncQueueRepository';

export class BirthdayRepository {
  private get db() {
    return database.getDb();
  }
  
  async create(input: BirthdayInput): Promise<Birthday> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    const birthday: Birthday = {
      id,
      name: input.name,
      date: input.date,
      notes: input.notes,
      phone: input.phone,
      email: input.email,
      birth_year: input.birth_year,
      relationship_type: input.relationship_type || DEFAULT_RELATIONSHIP_TYPE,
      theme_color_id: input.theme_color_id || DEFAULT_THEME_COLOR_ID,
      photo_url: input.photo_url,
      updated_at: now,
      metadata: input.metadata
    };
    
    await this.db.runAsync(
      `INSERT INTO birthdays (
        id, name, date, notes, phone, email, birth_year, 
        relationship_type, theme_color_id, photo_url, 
        metadata, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      birthday.id,
      birthday.name,
      birthday.date,
      birthday.notes || null,
      birthday.phone || null,
      birthday.email || null,
      birthday.birth_year || null,
      birthday.relationship_type,
      birthday.theme_color_id,
      birthday.photo_url || null,
      birthday.metadata ? JSON.stringify(birthday.metadata) : null,
      birthday.updated_at
    );
    
    // Queue for sync to backend
    await this.queueSyncOperation('create', birthday.id, birthday);
    
    return birthday;
  }
  
  async update(id: string, updates: Partial<BirthdayInput>): Promise<Birthday | null> {
    const now = new Date().toISOString();
    
    // Build dynamic update query
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.birth_year !== undefined) {
      fields.push('birth_year = ?');
      values.push(updates.birth_year);
    }
    if (updates.relationship_type !== undefined) {
      fields.push('relationship_type = ?');
      values.push(updates.relationship_type);
    }
    if (updates.theme_color_id !== undefined) {
      fields.push('theme_color_id = ?');
      values.push(updates.theme_color_id);
    }
    if (updates.photo_url !== undefined) {
      fields.push('photo_url = ?');
      values.push(updates.photo_url);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE birthdays SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      ...values
    );
    
    const updated = await this.findById(id);
    if (updated) {
      // Queue for sync to backend
      await this.queueSyncOperation('update', id, updates);
    }
    
    return updated;
  }
  
  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    
    // Soft delete
    await this.db.runAsync(
      'UPDATE birthdays SET deleted_at = ?, updated_at = ? WHERE id = ?',
      now,
      now,
      id
    );
    
    // Queue for sync to backend
    await this.queueSyncOperation('delete', id, {});
  }
  
  async findById(id: string): Promise<Birthday | null> {
    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM birthdays WHERE id = ? AND deleted_at IS NULL',
      id
    );
    
    return row ? this.formatBirthdayRow(row) : null;
  }
  
  async findAll(): Promise<Birthday[]> {
    const results = await this.db.getAllAsync<any>(
      `SELECT * FROM birthdays 
       WHERE deleted_at IS NULL 
       ORDER BY date ASC`
    );
    return results ? results.map(row => this.formatBirthdayRow(row)) : [];
  }
  
  async findUpcoming(days: number = 30): Promise<Birthday[]> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    // This query handles birthdays that wrap around the year
    const results = await this.db.getAllAsync<any>(
      `SELECT * FROM birthdays 
       WHERE deleted_at IS NULL 
       ORDER BY 
         CASE 
           WHEN strftime('%m-%d', date) >= strftime('%m-%d', 'now')
           THEN strftime('%m-%d', date)
           ELSE strftime('%m-%d', date) || 'z'
         END
       LIMIT ?`,
      days > 0 ? days : 10
    );
    
    return results ? results.map(row => this.formatBirthdayRow(row)) : [];
  }
  
  // For sync - get all changes since a timestamp
  async getChangesSince(timestamp: string | null): Promise<Birthday[]> {
    if (!timestamp) {
      return this.findAll();
    }
    
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM birthdays WHERE updated_at > ? ORDER BY updated_at ASC',
      timestamp
    );
    return results ? results.map(row => this.formatBirthdayRow(row)) : [];
  }

  // Sync methods
  async updateFromRemote(birthday: Birthday): Promise<void> {
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT OR REPLACE INTO birthdays (
        id, name, date, notes, phone, email, birth_year,
        relationship_type, theme_color_id, photo_url,
        metadata, updated_at, synced_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      birthday.id,
      birthday.name,
      birthday.date,
      birthday.notes || null,
      birthday.phone || null,
      birthday.email || null,
      birthday.birth_year || null,
      birthday.relationship_type,
      birthday.theme_color_id,
      birthday.photo_url || null,
      birthday.metadata ? JSON.stringify(birthday.metadata) : null,
      birthday.updated_at,
      now, // synced_at
      birthday.deleted_at || null
    );
  }

  async markSynced(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE birthdays SET synced_at = ? WHERE id = ?',
      now,
      id
    );
  }

  // Helper methods
  private formatBirthdayRow(row: any): Birthday {
    return {
      id: row.id,
      name: row.name,
      date: row.date,
      notes: row.notes,
      phone: row.phone,
      email: row.email,
      birth_year: row.birth_year,
      relationship_type: row.relationship_type || DEFAULT_RELATIONSHIP_TYPE,
      theme_color_id: row.theme_color_id || DEFAULT_THEME_COLOR_ID,
      photo_url: row.photo_url,
      updated_at: row.updated_at,
      synced_at: row.synced_at,
      deleted_at: row.deleted_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  private async queueSyncOperation(operation: 'create' | 'update' | 'delete', recordId: string, data: any): Promise<void> {
    try {
      await syncQueueRepository.add(operation, 'birthdays', recordId, data);
    } catch (error) {
      console.warn('Failed to queue sync operation:', error);
      // Don't throw - local operation should succeed even if sync queueing fails
    }
  }
}

// Singleton instance
export const birthdayRepository = new BirthdayRepository();