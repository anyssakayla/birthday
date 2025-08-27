import { z } from 'zod';

// Phone verification flow
export const SendVerificationSchema = z.object({
  phone: z.string().min(10).max(15), // E.164 format: +1234567890
});

export const VerifyPhoneSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6), // 6-digit verification code
  deviceName: z.string().max(100).optional(),
  deviceId: z.string().max(100).optional(),
});

// Optional recovery password
export const SetRecoveryPasswordSchema = z.object({
  password: z.string().min(8).max(100),
});

export const RecoveryLoginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string(),
  deviceName: z.string().max(100).optional(),
  deviceId: z.string().max(100).optional(),
});

// Device token management
export const RefreshTokenSchema = z.object({
  deviceToken: z.string(),
});

// Input/Output types
export type SendVerificationInput = z.infer<typeof SendVerificationSchema>;
export type VerifyPhoneInput = z.infer<typeof VerifyPhoneSchema>;
export type SetRecoveryPasswordInput = z.infer<typeof SetRecoveryPasswordSchema>;
export type RecoveryLoginInput = z.infer<typeof RecoveryLoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

// User representation (without sensitive data)
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  phoneVerified: boolean;
  subscription: 'free' | 'premium';
  hasRecoveryPassword: boolean;
  createdAt: string;
}

// Authentication response with tokens
export interface AuthResponse {
  user: User;
  deviceToken: string;
  expiresAt: string;
}

// Device token info
export interface DeviceTokenInfo {
  id: string;
  deviceName?: string;
  deviceId?: string;
  lastUsed: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

// Verification code response
export interface VerificationResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until code expires
}

// Auth errors
export class AuthError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid credentials') {
    super('INVALID_CREDENTIALS', message, 401);
  }
}

export class PhoneNotVerifiedError extends AuthError {
  constructor() {
    super('PHONE_NOT_VERIFIED', 'Phone number not verified', 401);
  }
}

export class VerificationExpiredError extends AuthError {
  constructor() {
    super('VERIFICATION_EXPIRED', 'Verification code expired', 400);
  }
}

export class TooManyAttemptsError extends AuthError {
  constructor() {
    super('TOO_MANY_ATTEMPTS', 'Too many verification attempts', 429);
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('TOKEN_EXPIRED', 'Device token expired', 401);
  }
}