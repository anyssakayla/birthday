import * as SQLite from 'expo-sqlite';

export interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

// All migrations - add new ones at the end
export const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema with core fields',
    up: async (db) => {
      // Main birthdays table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS birthdays (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          synced_at TEXT,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );
        
        CREATE INDEX idx_birthdays_date ON birthdays(date);
        CREATE INDEX idx_birthdays_deleted ON birthdays(deleted_at);
      `);
      
      // Sync queue for offline-first
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          operation TEXT NOT NULL,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0,
          last_error TEXT
        );
        
        CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);
      `);
      
      // Schema version tracking
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL
        );
      `);
    }
  },
  // Example of adding a field later:
  // {
  //   version: 2,
  //   description: 'Add notes field',
  //   up: async (db) => {
  //     await db.execAsync('ALTER TABLE birthdays ADD COLUMN notes TEXT;');
  //   }
  // }
];

// Migration runner
export class MigrationRunner {
  constructor(private db: SQLite.SQLiteDatabase) {}
  
  async getCurrentVersion(): Promise<number> {
    try {
      const result = await this.db.getFirstAsync<{ version: number }>(
        'SELECT MAX(version) as version FROM schema_version'
      );
      return result?.version || 0;
    } catch {
      // Table doesn't exist yet
      return 0;
    }
  }
  
  async runMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration ${migration.version}: ${migration.description}`);
        
        try {
          await migration.up(this.db);
          
          // Record migration
          await this.db.runAsync(
            'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
            migration.version,
            new Date().toISOString()
          );
          
          console.log(`Migration ${migration.version} completed`);
        } catch (error) {
          console.error(`Migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    }
  }
  
  async rollback(toVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    for (let i = migrations.length - 1; i >= 0; i--) {
      const migration = migrations[i];
      if (migration.version > toVersion && migration.version <= currentVersion) {
        if (migration.down) {
          console.log(`Rolling back migration ${migration.version}`);
          await migration.down(this.db);
          await this.db.runAsync(
            'DELETE FROM schema_version WHERE version = ?',
            migration.version
          );
        } else {
          console.warn(`No rollback defined for migration ${migration.version}`);
        }
      }
    }
  }
}