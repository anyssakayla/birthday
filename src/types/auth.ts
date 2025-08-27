// Auth types for phone-based authentication
export interface User {
  id: string;
  phone: string;
  name?: string;
  phone_verified: boolean;
  subscription?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  last_used_at: string;
  created_at: string;
  is_current: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  is_authenticated: boolean;
  is_loading: boolean;
  verification_pending?: boolean;
}

// Verification flow types
export interface VerificationState {
  phone?: string;
  code_sent: boolean;
  code_expires_at?: string;
  error?: string;
}

// Phone validation helper
export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation - can be enhanced
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.trim());
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add + if not present and starts with country code
  if (!cleaned.startsWith('+') && cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}