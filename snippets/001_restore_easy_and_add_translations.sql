-- PROPOSAL ONLY.
-- Generate a new Supabase migration and reconcile with the current schema.

-- 1) Restore easy difficulty.
-- Current upstream history originally had easy, then removed it.
ALTER TYPE difficulty_level_enum
  ADD VALUE IF NOT EXISTS 'easy' BEFORE 'normal';

-- 2) Translation status.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'translation_status_enum'
  ) THEN
    CREATE TYPE translation_status_enum
      AS ENUM ('generated', 'reviewed', 'stale');
  END IF;
END $$;

-- 3) Derived translations.
CREATE TABLE IF NOT EXISTS bill_content_translations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  bill_content_id UUID NOT NULL
    REFERENCES bill_contents(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  status translation_status_enum NOT NULL DEFAULT 'generated',
  translation_model TEXT,
  source_hash TEXT NOT NULL,
  translated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bill_content_id, locale),
  CHECK (locale IN ('en', 'zh-Hans', 'ko', 'ne', 'my', 'vi'))
);

CREATE INDEX IF NOT EXISTS
  idx_bill_content_translations_content
  ON bill_content_translations(bill_content_id);

CREATE INDEX IF NOT EXISTS
  idx_bill_content_translations_locale
  ON bill_content_translations(locale);

-- Add the project's standard updated_at trigger here if available.
-- RLS policies must be added to match the existing public-read/admin-write pattern.
