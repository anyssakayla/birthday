import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, UserSettingsInput, defaultUserSettings } from '@/types/settings';
import { settingsService } from '@/services/api/settingsService';
import { nanoid } from 'nanoid/non-secure';

interface SettingsStore {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  updateSettings: (updates: UserSettingsInput) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  syncSettings: () => Promise<void>;
  
  // Local getters
  isDarkMode: () => boolean;
  getNotificationTime: () => string;
}

const STORAGE_KEY = '@birthday_app_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to load from local storage first
      const localSettings = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings);
        set({ 
          settings: parsedSettings, 
          isLoading: false 
        });
        
        // Sync with backend in background
        get().syncSettings().catch(console.error);
      } else {
        // Create default settings with a new ID
        const newSettings: UserSettings = {
          ...defaultUserSettings,
          id: nanoid(),
          user_id: 'local_user', // Will be updated when user authenticates
          updated_at: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        set({ 
          settings: newSettings, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Settings initialization failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false 
      });
    }
  },

  updateSettings: async (updates: UserSettingsInput) => {
    const { settings } = get();
    if (!settings) return;

    set({ isLoading: true, error: null });

    try {
      // Update local settings optimistically
      const updatedSettings: UserSettings = {
        ...settings,
        ...updates,
        // Merge nested objects properly
        notifications: updates.notifications ? 
          { ...settings.notifications, ...updates.notifications } : 
          settings.notifications,
        display: updates.display ? 
          { ...settings.display, ...updates.display } : 
          settings.display,
        messages: updates.messages ? 
          { ...settings.messages, ...updates.messages } : 
          settings.messages,
        privacy: updates.privacy ? 
          { ...settings.privacy, ...updates.privacy } : 
          settings.privacy,
        updated_at: new Date().toISOString(),
      };

      // Save to local storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      
      set({ 
        settings: updatedSettings, 
        isLoading: false 
      });

      // Sync with backend
      get().syncSettings().catch(console.error);
    } catch (error) {
      console.error('Settings update failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false 
      });
    }
  },

  toggleDarkMode: async () => {
    const { settings } = get();
    if (!settings) return;

    await get().updateSettings({
      display: {
        dark_mode: !settings.display.dark_mode,
      }
    });
  },

  syncSettings: async () => {
    try {
      // TODO: Implement when authentication is ready
      // const response = await settingsService.getSettings();
      // if (response.success) {
      //   set({ settings: response.data.settings });
      //   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.settings));
      // }
    } catch (error) {
      console.error('Settings sync failed:', error);
      // Don't set error state for background sync failures
    }
  },

  // Utility getters
  isDarkMode: () => {
    const { settings } = get();
    return settings?.display.dark_mode ?? false;
  },

  getNotificationTime: () => {
    const { settings } = get();
    return settings?.notifications.reminder_time ?? '09:00';
  },
}));