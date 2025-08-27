-- Add missing tables for birthday app
-- Run this in TablePlus after the initial setup

-- Gift transactions table (for revenue tracking)
CREATE TABLE IF NOT EXISTS gift_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  birthday_id TEXT REFERENCES birthdays(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,           -- 'amazon', 'target', 'starbucks', etc.
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('gift_card', 'affiliate_click', 'affiliate_purchase')),
  amount DECIMAL(10, 2),            -- Purchase amount (null for clicks)
  commission DECIMAL(10, 4),        -- Our commission earned
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  external_transaction_id TEXT,     -- Provider's transaction ID
  metadata JSONB DEFAULT '{}',      -- Additional data (product info, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  birthday_id TEXT REFERENCES birthdays(id) ON DELETE CASCADE, -- null = global template
  relationship_type TEXT CHECK (relationship_type IN ('family', 'friend', 'colleague', 'other')),
  template_text TEXT NOT NULL,
  is_global BOOLEAN DEFAULT false,  -- true for user's global templates
  language TEXT DEFAULT 'en',      -- for future multilingual support
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync log table (for monitoring sync health)
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT,                   -- Unique device identifier
  operation TEXT NOT NULL CHECK (operation IN ('push', 'pull', 'conflict_resolution')),
  table_name TEXT,                  -- Which table was synced
  records_affected INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_details JSONB,              -- Error messages and stack traces
  sync_duration_ms INTEGER,         -- How long the sync took
  data_size_bytes INTEGER,          -- Amount of data transferred
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (for user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One setting per key per user
  UNIQUE(user_id, setting_key)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_transactions_user_id ON gift_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_birthday_id ON gift_transactions(birthday_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_status ON gift_transactions(status);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_created_at ON gift_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_birthday_id ON message_templates(birthday_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_relationship ON message_templates(relationship_type);

CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);

-- Add partial unique constraint for global templates (PostgreSQL syntax)
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_templates_global_unique 
ON message_templates(user_id, relationship_type) 
WHERE is_global = true AND birthday_id IS NULL;

-- Add some default global message templates for our test user
INSERT INTO message_templates (user_id, relationship_type, template_text, is_global) 
SELECT users.id, 'friend', 'Happy Birthday! 🎉 Hope you have an amazing day!', true
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, relationship_type) WHERE is_global = true AND birthday_id IS NULL DO NOTHING;

INSERT INTO message_templates (user_id, relationship_type, template_text, is_global) 
SELECT users.id, 'family', 'Happy Birthday! 🎂 Wishing you all the best on your special day! Love you!', true
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, relationship_type) WHERE is_global = true AND birthday_id IS NULL DO NOTHING;

INSERT INTO message_templates (user_id, relationship_type, template_text, is_global) 
SELECT users.id, 'colleague', 'Happy Birthday! 🎈 Hope you have a wonderful day!', true
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, relationship_type) WHERE is_global = true AND birthday_id IS NULL DO NOTHING;

-- Add some test settings
INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'notification_time', '"09:00"'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, setting_key) DO NOTHING;

INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'subscription_type', '"free"'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, setting_key) DO NOTHING;

-- Test gift transaction
INSERT INTO gift_transactions (user_id, birthday_id, provider, transaction_type, amount, commission, status)
SELECT users.id, 'test-birthday-1', 'amazon', 'gift_card', 25.00, 1.25, 'completed'
FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

SELECT 'Additional tables created successfully!' as status;
SELECT 'Tables now include: gift_transactions, message_templates, sync_log, user_settings' as info;