-- Add PostgreSQL functions for birthday operations

-- Function to get upcoming birthdays (handles year wraparound)
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(
  user_id_param UUID,
  days_param INTEGER DEFAULT 30
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  date DATE,
  notes TEXT,
  phone TEXT,
  email TEXT,
  birth_year INTEGER,
  relationship_type TEXT,
  theme_color_id TEXT,
  photo_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
) LANGUAGE SQL STABLE AS $$
  SELECT 
    b.id,
    b.user_id,
    b.name,
    b.date,
    b.notes,
    b.phone,
    b.email,
    b.birth_year,
    b.relationship_type,
    b.theme_color_id,
    b.photo_url,
    b.metadata,
    b.created_at,
    b.updated_at,
    b.deleted_at
  FROM birthdays b
  WHERE b.user_id = user_id_param
    AND b.deleted_at IS NULL
  ORDER BY 
    CASE 
      -- Handle birthdays that occur later this year
      WHEN EXTRACT(MONTH FROM b.date) > EXTRACT(MONTH FROM CURRENT_DATE) 
        OR (EXTRACT(MONTH FROM b.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(DAY FROM b.date) >= EXTRACT(DAY FROM CURRENT_DATE))
      THEN 
        -- Days until birthday this year
        (DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
              EXTRACT(MONTH FROM b.date) || '-' || 
              EXTRACT(DAY FROM b.date)) - CURRENT_DATE)
      ELSE 
        -- Days until birthday next year
        (DATE((EXTRACT(YEAR FROM CURRENT_DATE) + 1) || '-' || 
              EXTRACT(MONTH FROM b.date) || '-' || 
              EXTRACT(DAY FROM b.date)) - CURRENT_DATE)
    END ASC
  LIMIT CASE 
    WHEN days_param > 0 THEN days_param 
    ELSE 30 
  END;
$$;

-- Function to get birthday statistics
CREATE OR REPLACE FUNCTION get_birthday_stats(
  user_id_param UUID,
  current_month_param INTEGER,
  thirty_days_ago_param TIMESTAMPTZ
) RETURNS JSON LANGUAGE SQL STABLE AS $$
  SELECT json_build_object(
    'total_count', 
    (SELECT COUNT(*) FROM birthdays WHERE user_id = user_id_param AND deleted_at IS NULL),
    
    'this_month_count',
    (SELECT COUNT(*) FROM birthdays 
     WHERE user_id = user_id_param 
       AND deleted_at IS NULL 
       AND EXTRACT(MONTH FROM date) = current_month_param),
    
    'upcoming_count',
    (SELECT COUNT(*) FROM get_upcoming_birthdays(user_id_param, 7)),
    
    'recent_additions',
    (SELECT COUNT(*) FROM birthdays 
     WHERE user_id = user_id_param 
       AND deleted_at IS NULL 
       AND created_at >= thirty_days_ago_param)
  );
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_birthdays_user_id_date 
  ON birthdays(user_id, date) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_birthdays_user_id_updated_at 
  ON birthdays(user_id, updated_at) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_birthdays_user_id_name 
  ON birthdays(user_id, name) 
  WHERE deleted_at IS NULL;

-- Add GIN index for metadata search (if needed in future)
CREATE INDEX IF NOT EXISTS idx_birthdays_metadata_gin 
  ON birthdays USING GIN (metadata);

-- Update the birthdays table to add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'phone'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN phone TEXT;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'email'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN email TEXT;
  END IF;

  -- Add birth_year column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'birth_year'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN birth_year INTEGER;
  END IF;

  -- Add relationship_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'relationship_type'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN relationship_type TEXT DEFAULT 'friend';
  END IF;

  -- Add theme_color_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'theme_color_id'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN theme_color_id TEXT DEFAULT '1';
  END IF;

  -- Add photo_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN photo_url TEXT;
  END IF;

  -- Add metadata column if it doesn't exist (change from JSONB to JSON for better compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'birthdays' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN metadata JSONB;
  END IF;
END $$;