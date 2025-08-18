import { nanoid } from 'nanoid/non-secure';
import { database } from '../db';
import { Birthday, BirthdayInput } from '../../types';

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
      updated_at: now,
    };
    
    await this.db.runAsync(
      `INSERT INTO birthdays (id, name, date, updated_at) 
       VALUES (?, ?, ?, ?)`,
      birthday.id,
      birthday.name,
      birthday.date,
      birthday.updated_at
    );
    
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
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE birthdays SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      ...values
    );
    
    return this.findById(id);
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
  }
  
  async findById(id: string): Promise<Birthday | null> {
    return await this.db.getFirstAsync<Birthday>(
      'SELECT * FROM birthdays WHERE id = ? AND deleted_at IS NULL',
      id
    );
  }
  
  async findAll(): Promise<Birthday[]> {
    const results = await this.db.getAllAsync<Birthday>(
      `SELECT * FROM birthdays 
       WHERE deleted_at IS NULL 
       ORDER BY date ASC`
    );
    return results || [];
  }
  
  async findUpcoming(days: number = 30): Promise<Birthday[]> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    // This query handles birthdays that wrap around the year
    const results = await this.db.getAllAsync<Birthday>(
      `SELECT * FROM birthdays 
       WHERE deleted_at IS NULL 
       ORDER BY 
         CASE 
           WHEN strftime('%m-%d', date) >= strftime('%m-%d', 'now')
           THEN strftime('%m-%d', date)
           ELSE strftime('%m-%d', date) || 'z'
         END
       LIMIT 10`
    );
    
    return results || [];
  }
  
  // For sync - get all changes since a timestamp
  async getChangesSince(timestamp: string | null): Promise<Birthday[]> {
    if (!timestamp) {
      return this.findAll();
    }
    
    const results = await this.db.getAllAsync<Birthday>(
      'SELECT * FROM birthdays WHERE updated_at > ? ORDER BY updated_at ASC',
      timestamp
    );
    return results || [];
  }
}

// Singleton instance
export const birthdayRepository = new BirthdayRepository();