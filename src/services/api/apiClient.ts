import { config } from '@/config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  success: boolean;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.defaultTimeout = config.api.timeout;
  }

  async initialize(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem(config.auth.tokenKey);
    } catch (error) {
      console.warn('Failed to load auth token:', error);
    }
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = false,
      timeout = this.defaultTimeout,
    } = options;

    // Check network connectivity
    if (!(await this.isOnline())) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'No internet connection',
        },
      };
    }

    try {
      // Prepare headers
      let requestHeaders = { ...headers };
      if (requireAuth || this.authToken) {
        requestHeaders = { ...requestHeaders, ...(await this.getAuthHeaders()) };
      }

      // Prepare request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      // Make request
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, requestOptions);
      
      clearTimeout(timeoutId);

      // Handle response
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        responseData = {};
      }

      if (response.ok) {
        return {
          success: true,
          data: responseData,
        };
      } else {
        // Handle 401 (Unauthorized) - token might be expired
        if (response.status === 401 && this.authToken) {
          await this.handleTokenExpired();
        }

        return {
          success: false,
          error: responseData?.error || {
            code: `HTTP_${response.status}`,
            message: `Request failed with status ${response.status}`,
          },
        };
      }
    } catch (error: any) {
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = 'An unknown error occurred';

      if (error.name === 'AbortError') {
        errorCode = 'TIMEOUT_ERROR';
        errorMessage = 'Request timed out';
      } else if (error.message.includes('Network request failed')) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'Network request failed';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }
  }

  private async handleTokenExpired(): Promise<void> {
    // Clear expired token
    this.authToken = null;
    await AsyncStorage.removeItem(config.auth.tokenKey);
    
    // TODO: Trigger re-authentication flow
    // This could emit an event that the auth store listens to
    console.warn('Auth token expired - user needs to re-authenticate');
  }

  // Convenience methods
  async get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();