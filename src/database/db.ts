import * as SQLite from 'expo-sqlite';
import { MigrationRunner } from './migrations';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync('birthdays.db');
      
      // Run migrations
      const migrationRunner = new MigrationRunner(this.db);
      await migrationRunner.runMigrations();
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
  
  getDb(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }
  
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Singleton instance
export const database = new Database();