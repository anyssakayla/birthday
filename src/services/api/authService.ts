import { apiClient, ApiResponse } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/environment';

// Types for auth responses
export interface SendVerificationResponse {
  message: string;
  expires_at: string;
}

export interface VerifyPhoneResponse {
  user: {
    id: string;
    phone: string;
    name?: string;
    phone_verified: boolean;
    created_at: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
  device: {
    id: string;
    name: string;
    created_at: string;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_at: string;
}

export interface UserDevice {
  id: string;
  name: string;
  last_used_at: string;
  created_at: string;
  is_current: boolean;
}

export interface RecoveryLoginResponse {
  user: {
    id: string;
    phone: string;
    name?: string;
  };
  recovery_required: boolean;
  message: string;
}

export class AuthService {
  async sendVerificationCode(phone: string): Promise<ApiResponse<SendVerificationResponse>> {
    return apiClient.post<SendVerificationResponse>('/api/auth/verify/send', {
      phone,
    });
  }

  async verifyPhoneAndAuth(
    phone: string,
    code: string,
    deviceName: string,
    name?: string
  ): Promise<ApiResponse<VerifyPhoneResponse>> {
    const response = await apiClient.post<VerifyPhoneResponse>('/api/auth/verify/confirm', {
      phone,
      verification_code: code,
      device_name: deviceName,
      name,
    });

    // Store tokens on successful auth
    if (response.success && response.data) {
      await this.storeTokens(response.data.tokens);
      apiClient.setAuthToken(response.data.tokens.access_token);
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = await AsyncStorage.getItem(config.auth.refreshTokenKey);
    if (!refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
        },
      };
    }

    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/token/refresh', {
      refresh_token: refreshToken,
    });

    // Update stored access token on successful refresh
    if (response.success && response.data) {
      await AsyncStorage.setItem(config.auth.tokenKey, response.data.access_token);
      apiClient.setAuthToken(response.data.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<VerifyPhoneResponse['user']>> {
    return apiClient.get('/api/auth/me', { requireAuth: true });
  }

  async getUserDevices(): Promise<ApiResponse<UserDevice[]>> {
    return apiClient.get('/api/auth/devices', { requireAuth: true });
  }

  async revokeDeviceToken(tokenId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/api/auth/devices/${tokenId}`, { requireAuth: true });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    // Call backend logout
    const response = await apiClient.post('/api/auth/logout', {}, { requireAuth: true });

    // Clear local tokens regardless of backend response
    await this.clearTokens();

    return response;
  }

  async recoveryLogin(phone: string, recoveryPassword: string): Promise<ApiResponse<RecoveryLoginResponse>> {
    return apiClient.post<RecoveryLoginResponse>('/api/auth/recovery/login', {
      phone,
      recovery_password: recoveryPassword,
    });
  }

  async setRecoveryPassword(recoveryPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/api/auth/recovery/password', {
      recovery_password: recoveryPassword,
    }, { requireAuth: true });
  }

  // Token management helpers
  private async storeTokens(tokens: VerifyPhoneResponse['tokens']): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(config.auth.tokenKey, tokens.access_token),
        AsyncStorage.setItem(config.auth.refreshTokenKey, tokens.refresh_token),
      ]);
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
      throw error;
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(config.auth.tokenKey),
        AsyncStorage.removeItem(config.auth.refreshTokenKey),
      ]);
      apiClient.setAuthToken(null);
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(config.auth.tokenKey);
    return token !== null;
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(config.auth.tokenKey);
  }
}

// Create singleton instance
export const authService = new AuthService();