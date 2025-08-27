import { birthdayService } from './birthdayService';
import { settingsService } from './settingsService';
import { apiClient } from './apiClient';
import { syncQueueRepository } from '@/database/repositories/syncQueueRepository';
import { SyncQueueItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Birthday, BirthdayInput } from '@/types/birthday';
import { UserSettings, UserSettingsInput } from '@/types/settings';
import { MessageTemplate } from '@/stores/templateStore';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  last_sync: string | null;
  pending_count: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  processed_count: number;
  error_count: number;
  errors: Array<{
    item: SyncQueueItem;
    error: string;
  }>;
  last_sync_at: string;
}

const LAST_SYNC_KEY = 'last_sync_timestamp';
const MAX_RETRY_COUNT = 3;
const SYNC_BATCH_SIZE = 10;

export class SyncService {
  private syncInProgress = false;
  private syncListeners: Array<(state: SyncState) => void> = [];

  // Event handling
  addSyncListener(listener: (state: SyncState) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(state: SyncState): void {
    this.syncListeners.forEach(listener => listener(state));
  }

  // Get current sync status
  async getSyncState(): Promise<SyncState> {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const pendingCount = await syncQueueRepository.getPendingCount();
    
    return {
      status: this.syncInProgress ? 'syncing' : (await apiClient.isOnline() ? 'idle' : 'offline'),
      last_sync: lastSync,
      pending_count: pendingCount,
    };
  }

  // Full sync operation
  async performFullSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    if (!(await apiClient.isOnline())) {
      throw new Error('No internet connection');
    }

    this.syncInProgress = true;
    const startState = await this.getSyncState();
    this.notifyListeners({ ...startState, status: 'syncing' });

    try {
      // Step 1: Push local changes to server
      const pushResult = await this.pushLocalChanges();

      // Step 2: Pull remote changes from server
      const pullResult = await this.pullRemoteChanges();

      // Step 3: Update sync timestamp
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

      const result: SyncResult = {
        success: pushResult.success && pullResult.success,
        processed_count: pushResult.processed_count + pullResult.processed_count,
        error_count: pushResult.error_count + pullResult.error_count,
        errors: [...pushResult.errors, ...pullResult.errors],
        last_sync_at: now,
      };

      const finalState = await this.getSyncState();
      this.notifyListeners(finalState);

      return result;

    } catch (error: any) {
      const errorState = await this.getSyncState();
      this.notifyListeners({ 
        ...errorState, 
        status: 'error', 
        error: error.message 
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Push local changes to server
  private async pushLocalChanges(): Promise<Omit<SyncResult, 'last_sync_at'>> {
    const queueItems = await syncQueueRepository.getAll();
    let processedCount = 0;
    let errorCount = 0;
    const errors: Array<{ item: SyncQueueItem; error: string }> = [];

    // Process items in batches
    for (let i = 0; i < queueItems.length; i += SYNC_BATCH_SIZE) {
      const batch = queueItems.slice(i, i + SYNC_BATCH_SIZE);
      
      for (const item of batch) {
        try {
          await this.processSyncItem(item);
          await syncQueueRepository.remove(item.id);
          processedCount++;
        } catch (error: any) {
          errorCount++;
          errors.push({ item, error: error.message });

          // Update retry count
          const retryCount = (item.retry_count || 0) + 1;
          if (retryCount < MAX_RETRY_COUNT) {
            await syncQueueRepository.updateError(item.id, error.message);
          } else {
            // Max retries reached, remove from queue
            await syncQueueRepository.remove(item.id);
          }
        }
      }
    }

    return {
      success: errorCount === 0,
      processed_count: processedCount,
      error_count: errorCount,
      errors,
    };
  }

  // Pull remote changes from server
  private async pullRemoteChanges(): Promise<Omit<SyncResult, 'last_sync_at'>> {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    let processedCount = 0;
    let errorCount = 0;
    const errors: Array<{ item: any; error: string }> = [];

    try {
      // Sync birthdays
      const birthdaySyncResult = await birthdayService.sync({ since: lastSync || undefined });
      if (birthdaySyncResult?.success && birthdaySyncResult.data) {
        // TODO: Update local database with remote changes
        // This will be implemented when we update the repositories
        processedCount += birthdaySyncResult.data.birthdays?.length || 0;
        processedCount += birthdaySyncResult.data.deleted_ids?.length || 0;
      } else {
        errorCount++;
        errors.push({ 
          item: { type: 'birthdays_sync' }, 
          error: birthdaySyncResult?.error?.message || 'Failed to sync birthdays' 
        });
      }

      // Sync settings and templates
      const settingsSyncResult = await settingsService.syncSettings(lastSync || undefined);
      if (settingsSyncResult?.success && settingsSyncResult.data) {
        // TODO: Update local settings and templates
        processedCount += 1; // settings
        processedCount += settingsSyncResult.data.templates?.length || 0;
      } else {
        errorCount++;
        errors.push({ 
          item: { type: 'settings_sync' }, 
          error: settingsSyncResult?.error?.message || 'Failed to sync settings' 
        });
      }

    } catch (error: any) {
      errorCount++;
      errors.push({ 
        item: { type: 'pull_sync' }, 
        error: error.message 
      });
    }

    return {
      success: errorCount === 0,
      processed_count: processedCount,
      error_count: errorCount,
      errors,
    };
  }

  // Process individual sync queue item
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const data = JSON.parse(item.data);

    switch (item.table_name) {
      case 'birthdays':
        await this.processBirthdaySync(item.operation, item.record_id, data);
        break;
      case 'user_settings':
        await this.processSettingsSync(item.operation, item.record_id, data);
        break;
      case 'message_templates':
        await this.processTemplateSync(item.operation, item.record_id, data);
        break;
      default:
        throw new Error(`Unknown table name: ${item.table_name}`);
    }
  }

  private async processBirthdaySync(operation: string, recordId: string, data: any): Promise<void> {
    switch (operation) {
      case 'create':
        const createResponse = await birthdayService.create(data as BirthdayInput);
        if (!createResponse.success) {
          throw new Error(createResponse.error?.message || 'Failed to create birthday');
        }
        break;

      case 'update':
        const updateResponse = await birthdayService.update(recordId, data as Partial<BirthdayInput>);
        if (!updateResponse.success) {
          throw new Error(updateResponse.error?.message || 'Failed to update birthday');
        }
        break;

      case 'delete':
        const deleteResponse = await birthdayService.delete(recordId);
        if (!deleteResponse.success) {
          throw new Error(deleteResponse.error?.message || 'Failed to delete birthday');
        }
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async processSettingsSync(operation: string, recordId: string, data: any): Promise<void> {
    if (operation === 'update') {
      const response = await settingsService.updateSettings(data as UserSettingsInput);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update settings');
      }
    } else {
      throw new Error(`Unsupported settings operation: ${operation}`);
    }
  }

  private async processTemplateSync(operation: string, recordId: string, data: any): Promise<void> {
    if (operation === 'update') {
      const response = await settingsService.updateTemplate(recordId, data.message);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update template');
      }
    } else {
      throw new Error(`Unsupported template operation: ${operation}`);
    }
  }

  // Quick sync - only process high priority items
  async performQuickSync(): Promise<void> {
    if (!await apiClient.isOnline()) {
      throw new Error('No internet connection');
    }

    const queueItems = await syncQueueRepository.getAll();
    const highPriorityItems = queueItems.slice(0, 5); // Process first 5 items

    for (const item of highPriorityItems) {
      try {
        await this.processSyncItem(item);
        await syncQueueRepository.remove(item.id);
      } catch (error: any) {
        await syncQueueRepository.updateError(item.id, error.message);
      }
    }
  }

  // Auto sync - called periodically
  async autoSync(): Promise<void> {
    if (this.syncInProgress || !(await apiClient.isOnline())) {
      return;
    }

    const pendingCount = await syncQueueRepository.getPendingCount();
    if (pendingCount === 0) {
      return;
    }

    try {
      await this.performQuickSync();
    } catch (error) {
      console.warn('Auto sync failed:', error);
    }
  }
}

// Create singleton instance
export const syncService = new SyncService();