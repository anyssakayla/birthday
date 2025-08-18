// Auth types for future backend integration
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  is_authenticated: boolean;
  is_loading: boolean;
}