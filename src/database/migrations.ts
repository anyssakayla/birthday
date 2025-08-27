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
  {
    version: 2,
    description: 'Add contact and relationship fields to birthdays',
    up: async (db) => {
      // Add all the new fields to the birthdays table
      await db.execAsync(`
        ALTER TABLE birthdays ADD COLUMN notes TEXT;
        ALTER TABLE birthdays ADD COLUMN phone TEXT;
        ALTER TABLE birthdays ADD COLUMN email TEXT;
        ALTER TABLE birthdays ADD COLUMN birth_year INTEGER;
        ALTER TABLE birthdays ADD COLUMN relationship_type TEXT DEFAULT 'friend';
        ALTER TABLE birthdays ADD COLUMN theme_color_id TEXT DEFAULT '1';
        ALTER TABLE birthdays ADD COLUMN photo_url TEXT;
        ALTER TABLE birthdays ADD COLUMN metadata TEXT;
      `);
      
      // Add indexes for better query performance
      await db.execAsync(`
        CREATE INDEX idx_birthdays_relationship ON birthdays(relationship_type);
        CREATE INDEX idx_birthdays_phone ON birthdays(phone);
        CREATE INDEX idx_birthdays_updated_at ON birthdays(updated_at);
      `);
    },
    down: async (db) => {
      // Note: SQLite doesn't support DROP COLUMN, so we'd need to recreate the table
      // For now, we'll leave this as a no-op since it's not critical for development
      console.warn('Rollback for migration 2 not implemented (SQLite limitation)');
    }
  },
  {
    version: 3,
    description: 'Add user settings table for local storage',
    up: async (db) => {
      // Create user_settings table to match backend structure
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          setting_key TEXT NOT NULL,
          setting_value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          synced_at TEXT,
          
          -- One setting per key per user
          UNIQUE(user_id, setting_key)
        );
        
        CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
        CREATE INDEX idx_user_settings_key ON user_settings(setting_key);
      `);
    },
    down: async (db) => {
      await db.execAsync('DROP TABLE IF EXISTS user_settings;');
    }
  }
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