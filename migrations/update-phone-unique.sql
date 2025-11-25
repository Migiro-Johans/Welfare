-- Migration: Make phone unique and member_id optional
-- Date: 2025-11-18

-- Drop the existing member_id unique constraint if it exists
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_member_id_key;

-- Make member_id nullable
ALTER TABLE members ALTER COLUMN member_id DROP NOT NULL;

-- Make phone NOT NULL and add unique constraint
ALTER TABLE members ALTER COLUMN phone SET NOT NULL;

-- Add unique constraint on phone if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'members_phone_key'
    ) THEN
        ALTER TABLE members ADD CONSTRAINT members_phone_key UNIQUE (phone);
    END IF;
END $$;

-- Create index on phone for better query performance
CREATE INDEX IF NOT EXISTS members_phone_idx ON members(phone);

-- Remove the unique index on member_id but keep it as a regular index for queries
DROP INDEX IF EXISTS members_member_id;
CREATE INDEX IF NOT EXISTS members_member_id_idx ON members(member_id) WHERE member_id IS NOT NULL;
