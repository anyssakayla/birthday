import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, syncService, authService } from './api';
import { SyncState, SyncStatus } from './api/syncService';

export interface SyncManagerConfig {
  autoSyncInterval: number; // milliseconds
  retryInterval: number; // milliseconds
  maxRetries: number;
  syncOnAppForeground: boolean;
  syncOnNetworkRestore: boolean;
}

export interface SyncNotification {
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'network_change';
  message: string;
  timestamp: string;
  data?: any;
}

const DEFAULT_CONFIG: SyncManagerConfig = {
  autoSyncInterval: 5 * 60 * 1000, // 5 minutes
  retryInterval: 30 * 1000, // 30 seconds
  maxRetries: 3,
  syncOnAppForeground: true,
  syncOnNetworkRestore: true,
};

const LAST_FULL_SYNC_KEY = 'last_full_sync_timestamp';
const SYNC_CONFIG_KEY = 'sync_manager_config';

export class SyncManager {
  private config: SyncManagerConfig = DEFAULT_CONFIG;
  private syncTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private isInitialized = false;
  private currentNetworkState: NetInfoState | null = null;
  private appState: AppStateStatus = 'active';
  
  // Event listeners
  private syncListeners: Array<(state: SyncState) => void> = [];
  private notificationListeners: Array<(notification: SyncNotification) => void> = [];

  // Singleton pattern
  private static instance: SyncManager | null = null;
  
  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize API client
      await apiClient.initialize();

      // Load configuration
      await this.loadConfig();

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Set up app state monitoring
      this.setupAppStateMonitoring();

      // Set up sync service listeners
      this.setupSyncServiceListeners();

      // Start auto-sync if user is authenticated
      if (await authService.isAuthenticated()) {
        await this.startAutoSync();
      }

      this.isInitialized = true;
      console.log('SyncManager initialized');
    } catch (error) {
      console.error('Failed to initialize SyncManager:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    this.stopAutoSync();
    this.stopRetryTimer();
    
    // Remove app state listener
    AppState.removeEventListener('change', this.handleAppStateChange);
    
    this.isInitialized = false;
  }

  // Configuration management
  async updateConfig(newConfig: Partial<SyncManagerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();

    // Restart auto-sync with new interval
    if (this.syncTimer) {
      this.stopAutoSync();
      await this.startAutoSync();
    }
  }

  getConfig(): SyncManagerConfig {
    return { ...this.config };
  }

  // Sync operations
  async triggerFullSync(): Promise<void> {
    if (!await authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    this.notify({
      type: 'sync_start',
      message: 'Starting full synchronization...',
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await syncService.performFullSync();
      
      if (result.success) {
        await AsyncStorage.setItem(LAST_FULL_SYNC_KEY, result.last_sync_at);
        this.retryCount = 0; // Reset retry count on success
        
        this.notify({
          type: 'sync_complete',
          message: `Sync completed. Processed ${result.processed_count} items.`,
          timestamp: new Date().toISOString(),
          data: result,
        });
      } else {
        throw new Error(`Sync completed with ${result.error_count} errors`);
      }
    } catch (error: any) {
      this.handleSyncError(error);
      throw error;
    }
  }

  async triggerQuickSync(): Promise<void> {
    if (!await authService.isAuthenticated()) {
      return; // Silently skip if not authenticated
    }

    try {
      await syncService.performQuickSync();
    } catch (error) {
      console.warn('Quick sync failed:', error);
    }
  }

  // Network and connectivity
  async isOnline(): Promise<boolean> {
    return apiClient.isOnline();
  }

  getCurrentNetworkState(): NetInfoState | null {
    return this.currentNetworkState;
  }

  // Status and monitoring
  async getSyncStatus(): Promise<SyncState> {
    return syncService.getSyncState();
  }

  async getLastFullSyncTime(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_FULL_SYNC_KEY);
  }

  async shouldPerformFullSync(): Promise<boolean> {
    const lastSync = await this.getLastFullSyncTime();
    if (!lastSync) return true;

    const lastSyncTime = new Date(lastSync).getTime();
    const now = Date.now();
    const timeDiff = now - lastSyncTime;
    
    // Perform full sync if more than 24 hours have passed
    return timeDiff > 24 * 60 * 60 * 1000;
  }

  // Event listeners
  addSyncListener(listener: (state: SyncState) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  addNotificationListener(listener: (notification: SyncNotification) => void): () => void {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  // Private methods
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load sync config:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save sync config:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = this.currentNetworkState?.isConnected === false;
      const isNowOnline = state.isConnected === true;
      
      this.currentNetworkState = state;
      
      this.notify({
        type: 'network_change',
        message: state.isConnected ? 'Connection restored' : 'Connection lost',
        timestamp: new Date().toISOString(),
        data: { state },
      });

      // Trigger sync when network is restored
      if (wasOffline && isNowOnline && this.config.syncOnNetworkRestore) {
        setTimeout(() => {
          this.triggerQuickSync();
        }, 1000); // Small delay to ensure connection is stable
      }
    });
  }

  private setupAppStateMonitoring(): void {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const wasInBackground = this.appState === 'background' || this.appState === 'inactive';
    const isNowActive = nextAppState === 'active';
    
    this.appState = nextAppState;

    // Trigger sync when app comes to foreground
    if (wasInBackground && isNowActive && this.config.syncOnAppForeground) {
      if (await this.shouldPerformFullSync()) {
        this.triggerFullSync().catch(console.warn);
      } else {
        this.triggerQuickSync();
      }
    }

    // Stop auto-sync when app goes to background (to save battery)
    if (nextAppState === 'background') {
      this.stopAutoSync();
    } else if (nextAppState === 'active' && await authService.isAuthenticated()) {
      this.startAutoSync();
    }
  };

  private setupSyncServiceListeners(): void {
    syncService.addSyncListener((state: SyncState) => {
      // Forward sync state to our listeners
      this.syncListeners.forEach(listener => listener(state));
    });
  }

  private async startAutoSync(): Promise<void> {
    this.stopAutoSync(); // Clear existing timer

    if (!await authService.isAuthenticated()) {
      return;
    }

    this.syncTimer = setInterval(async () => {
      try {
        if (await this.isOnline()) {
          await this.triggerQuickSync();
        }
      } catch (error) {
        console.warn('Auto-sync failed:', error);
      }
    }, this.config.autoSyncInterval);
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private stopRetryTimer(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private handleSyncError(error: any): void {
    console.error('Sync error:', error);
    
    this.notify({
      type: 'sync_error',
      message: error.message || 'Sync failed',
      timestamp: new Date().toISOString(),
      data: { error },
    });

    // Implement retry logic
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      const retryDelay = this.config.retryInterval * Math.pow(2, this.retryCount - 1); // Exponential backoff
      
      this.retryTimer = setTimeout(async () => {
        try {
          await this.triggerFullSync();
        } catch (retryError) {
          this.handleSyncError(retryError);
        }
      }, retryDelay);
    } else {
      this.retryCount = 0; // Reset for next time
    }
  }

  private notify(notification: SyncNotification): void {
    this.notificationListeners.forEach(listener => listener(notification));
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();