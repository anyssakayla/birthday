-- Initial schema for Birthday Reminder App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birthdays table
CREATE TABLE IF NOT EXISTS public.birthdays (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_birth_year CHECK (birth_year IS NULL OR (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM NOW())::INTEGER))
);

-- Gift suggestions log (for AI tracking)
CREATE TABLE IF NOT EXISTS public.gift_suggestions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  birthday_id TEXT REFERENCES public.birthdays(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  suggestions JSONB NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message templates
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  birthday_id TEXT REFERENCES public.birthdays(id) ON DELETE CASCADE,
  relationship_type TEXT,
  template_text TEXT NOT NULL,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync tracking
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_id TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('push', 'pull', 'conflict')),
  records_affected INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('success', 'failed', 'partial')),
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_birthdays_user_id ON public.birthdays(user_id);
CREATE INDEX idx_birthdays_date ON public.birthdays(date);
CREATE INDEX idx_birthdays_deleted_at ON public.birthdays(deleted_at);
CREATE INDEX idx_birthdays_synced_at ON public.birthdays(synced_at);
CREATE INDEX idx_gift_suggestions_user_id ON public.gift_suggestions_log(user_id);
CREATE INDEX idx_gift_suggestions_birthday_id ON public.gift_suggestions_log(birthday_id);
CREATE INDEX idx_message_templates_user_id ON public.message_templates(user_id);
CREATE INDEX idx_message_templates_birthday_id ON public.message_templates(birthday_id);
CREATE INDEX idx_sync_log_user_id ON public.sync_log(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_suggestions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see/edit their own birthdays
CREATE POLICY "Users can view own birthdays" ON public.birthdays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birthdays" ON public.birthdays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birthdays" ON public.birthdays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own birthdays" ON public.birthdays
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own gift suggestions
CREATE POLICY "Users can view own gift suggestions" ON public.gift_suggestions_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gift suggestions" ON public.gift_suggestions_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own message templates
CREATE POLICY "Users can view own templates" ON public.message_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON public.message_templates
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own sync logs
CREATE POLICY "Users can view own sync logs" ON public.sync_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON public.sync_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_birthdays_updated_at BEFORE UPDATE ON public.birthdays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();