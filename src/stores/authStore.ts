import { create } from 'zustand';
// import { authService } from '@/services/api';
// import { syncManager } from '@/services';
import { User, AuthTokens, AuthState, VerificationState, formatPhoneNumber, isValidPhoneNumber } from '@/types/auth';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

interface AuthStore extends AuthState {
  verification: VerificationState;
  
  // Actions
  initialize: () => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyCodeAndSignIn: (phone: string, code: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  refreshToken: () => Promise<void>;
  signOut: () => Promise<void>;
  recoveryLogin: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setRecoveryPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Verification state management
  clearVerification: () => void;
  setVerificationError: (error: string) => void;
}

const getDeviceName = (): string => {
  const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
  return `${deviceName} (${platform})`;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  is_authenticated: false,
  is_loading: false,
  verification_pending: false,
  verification: {
    code_sent: false,
    error: undefined,
  },

  initialize: async () => {
    set({ is_loading: true });
    
    try {
      // Temporarily disabled for debugging
      // TODO: Implement authentication check
      
      // No valid authentication found
      set({
        user: null,
        tokens: null,
        is_authenticated: false,
        is_loading: false,
      });
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({
        user: null,
        tokens: null,
        is_authenticated: false,
        is_loading: false,
      });
    }
  },

  sendVerificationCode: async (phone: string) => {
    // Temporarily disabled for debugging
    return { success: false, error: 'Authentication temporarily disabled' };
  },

  verifyCodeAndSignIn: async (phone: string, code: string, name?: string) => {
    // Temporarily disabled for debugging
    return { success: false, error: 'Authentication temporarily disabled' };
  },

  refreshToken: async () => {
    // Temporarily disabled for debugging
    console.log('Token refresh temporarily disabled');
  },

  signOut: async () => {
    // Clear local state
    set({
      user: null,
      tokens: null,
      is_authenticated: false,
      is_loading: false,
      verification_pending: false,
      verification: { code_sent: false },
    });
  },

  recoveryLogin: async (phone: string, password: string) => {
    // Temporarily disabled for debugging
    return { success: false, error: 'Recovery login temporarily disabled' };
  },

  setRecoveryPassword: async (password: string) => {
    // Temporarily disabled for debugging
    return { success: false, error: 'Set recovery password temporarily disabled' };
  },

  clearVerification: () => {
    set({
      verification: { code_sent: false },
      verification_pending: false,
    });
  },

  setVerificationError: (error: string) => {
    set({
      verification: { ...get().verification, error },
    });
  },
}));