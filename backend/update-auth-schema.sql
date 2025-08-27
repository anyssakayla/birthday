-- Update authentication schema for passwordless login
-- Run this after the previous scripts in TablePlus

-- 1. First, let's modify the users table for phone-based auth
-- Remove password requirement and add phone number
ALTER TABLE users 
  DROP COLUMN password_hash,
  ADD COLUMN phone TEXT UNIQUE,
  ADD COLUMN phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN recovery_password_hash TEXT, -- Optional password for account recovery
  ADD COLUMN verification_code TEXT,      -- Temporary SMS verification code
  ADD COLUMN verification_expires_at TIMESTAMPTZ; -- Code expiration

-- 2. Create device tokens table for persistent login
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,        -- Hashed version of the token
  device_name TEXT,                       -- "iPhone 13", "Samsung Galaxy", etc.
  device_id TEXT,                         -- Unique device identifier
  last_used TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year', -- Long-lived tokens
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create verification codes table for SMS/phone verification
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,                     -- 6-digit verification code
  attempts INTEGER DEFAULT 0,             -- Track failed attempts
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token_hash ON device_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_device_tokens_expires_at ON device_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- 5. Update our test user to use phone instead of password
UPDATE users 
SET 
  phone = '+1234567890',
  phone_verified = true
WHERE email = 'test@example.com';

-- 6. Create a test device token for our test user
INSERT INTO device_tokens (user_id, token_hash, device_name, device_id)
SELECT 
  users.id,
  'test_device_token_hash_12345',
  'Test Device',
  'test_device_001'
FROM users 
WHERE email = 'test@example.com'
ON CONFLICT (token_hash) DO NOTHING;

-- 7. Add some test settings for the passwordless flow
INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'auto_login_enabled', 'true'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, setting_key) DO UPDATE SET setting_value = 'true'::jsonb;

INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'sms_notifications', 'true'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, setting_key) DO UPDATE SET setting_value = 'true'::jsonb;

SELECT 'Passwordless authentication schema updated successfully!' as status;
SELECT 'Users now authenticate with phone number + device tokens' as info;
SELECT 'Optional recovery password can be set later' as note;