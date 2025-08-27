-- Quick setup script for TablePlus
-- Connection: localhost:54322, user: postgres, password: postgres

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified for testing)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium')),
  password_hash TEXT NOT NULL, -- For simple auth testing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birthdays table
CREATE TABLE IF NOT EXISTS birthdays (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  birth_year INTEGER,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  relationship_type TEXT CHECK (relationship_type IN ('family', 'friend', 'colleague', 'other')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Gift suggestions log (for AI tracking)
CREATE TABLE IF NOT EXISTS gift_suggestions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  birthday_id TEXT REFERENCES birthdays(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  suggestions JSONB NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_birthdays_user_id ON birthdays(user_id);
CREATE INDEX IF NOT EXISTS idx_birthdays_date ON birthdays(date);
CREATE INDEX IF NOT EXISTS idx_birthdays_deleted_at ON birthdays(deleted_at);

-- Insert test data
INSERT INTO users (email, name, password_hash) 
VALUES ('test@example.com', 'Test User', 'hashed_password_here')
ON CONFLICT (email) DO NOTHING;

-- Insert test birthday
INSERT INTO birthdays (id, user_id, name, date, notes)
SELECT 'test-birthday-1', users.id, 'John Doe', '1990-12-25', 'Loves tech and coffee'
FROM users WHERE email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;

SELECT 'Database setup complete!' as status;