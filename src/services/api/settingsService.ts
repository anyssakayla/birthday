import { apiClient, ApiResponse } from './apiClient';
import { UserSettings, UserSettingsInput } from '@/types/settings';
import { MessageTemplate } from '@/stores/templateStore';

export interface SettingsResponse {
  settings: UserSettings;
}

export interface TemplatesResponse {
  templates: MessageTemplate[];
}

export interface TemplateResponse {
  template: MessageTemplate;
}

export class SettingsService {
  // User settings operations
  async getSettings(): Promise<ApiResponse<SettingsResponse>> {
    return apiClient.get<SettingsResponse>('/api/settings', { requireAuth: true });
  }

  async updateSettings(updates: UserSettingsInput): Promise<ApiResponse<SettingsResponse>> {
    return apiClient.put<SettingsResponse>('/api/settings', updates, { requireAuth: true });
  }

  async resetSettings(): Promise<ApiResponse<SettingsResponse>> {
    return apiClient.post<SettingsResponse>('/api/settings/reset', {}, { requireAuth: true });
  }

  // Notification settings shortcuts
  async updateNotificationSettings(notifications: UserSettingsInput['notifications']): Promise<ApiResponse<SettingsResponse>> {
    return this.updateSettings({ notifications });
  }

  async updateDisplaySettings(display: UserSettingsInput['display']): Promise<ApiResponse<SettingsResponse>> {
    return this.updateSettings({ display });
  }

  async updateMessageSettings(messages: UserSettingsInput['messages']): Promise<ApiResponse<SettingsResponse>> {
    return this.updateSettings({ messages });
  }

  async updatePrivacySettings(privacy: UserSettingsInput['privacy']): Promise<ApiResponse<SettingsResponse>> {
    return this.updateSettings({ privacy });
  }

  // Message templates operations
  async getTemplates(): Promise<ApiResponse<TemplatesResponse>> {
    return apiClient.get<TemplatesResponse>('/api/settings/templates', { requireAuth: true });
  }

  async updateTemplate(templateId: string, message: string): Promise<ApiResponse<TemplateResponse>> {
    return apiClient.put<TemplateResponse>(`/api/settings/templates/${templateId}`, {
      message,
    }, { requireAuth: true });
  }

  async resetTemplate(templateId: string): Promise<ApiResponse<TemplateResponse>> {
    return apiClient.post<TemplateResponse>(`/api/settings/templates/${templateId}/reset`, {}, { requireAuth: true });
  }

  async resetAllTemplates(): Promise<ApiResponse<TemplatesResponse>> {
    return apiClient.post<TemplatesResponse>('/api/settings/templates/reset', {}, { requireAuth: true });
  }

  // Bulk template updates
  async updateMultipleTemplates(updates: Array<{ id: string; message: string }>): Promise<ApiResponse<TemplatesResponse>> {
    return apiClient.put<TemplatesResponse>('/api/settings/templates', {
      updates,
    }, { requireAuth: true });
  }

  // Data export/import
  async exportUserData(): Promise<ApiResponse<{ export_url: string; expires_at: string }>> {
    return apiClient.post('/api/settings/export', {}, { requireAuth: true });
  }

  async importUserData(data: any): Promise<ApiResponse<{ message: string; imported_count: number }>> {
    return apiClient.post('/api/settings/import', data, { requireAuth: true });
  }

  // Account management
  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/api/settings/delete-account', {}, { requireAuth: true });
  }

  // Sync settings - get settings changes since timestamp
  async syncSettings(since?: string): Promise<ApiResponse<{
    settings: UserSettings;
    templates: MessageTemplate[];
    last_sync_at: string;
  }>> {
    const searchParams = new URLSearchParams();
    if (since) searchParams.append('since', since);

    const queryString = searchParams.toString();
    const endpoint = `/api/settings/sync${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(endpoint, { requireAuth: true });
  }
}

// Create singleton instance
export const settingsService = new SettingsService();