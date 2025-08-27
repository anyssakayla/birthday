// API Services Export
export { apiClient } from './apiClient';
export { authService, AuthService } from './authService';
export { birthdayService, BirthdayService } from './birthdayService';
export { settingsService, SettingsService } from './settingsService';
export { syncService, SyncService } from './syncService';

// Type exports
export type { ApiResponse, ApiRequestOptions } from './apiClient';
export type { 
  SendVerificationResponse,
  VerifyPhoneResponse, 
  RefreshTokenResponse,
  UserDevice,
  RecoveryLoginResponse 
} from './authService';
export type {
  BirthdaysListResponse,
  BirthdayResponse,
  BirthdaysSyncResponse,
  BirthdaysListParams,
  BirthdaysSyncParams
} from './birthdayService';
export type {
  SettingsResponse,
  TemplatesResponse,
  TemplateResponse
} from './settingsService';
export type {
  SyncStatus,
  SyncState,
  SyncResult
} from './syncService';