-- Migration: Add total_expected_members to poll_settings
-- Date: 2025-11-18

-- Add total_expected_members column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'poll_settings' AND column_name = 'total_expected_members'
    ) THEN
        ALTER TABLE poll_settings
        ADD COLUMN total_expected_members INTEGER NOT NULL DEFAULT 300;
    END IF;
END $$;

-- Update existing poll_settings record if it exists
UPDATE poll_settings
SET total_expected_members = 300
WHERE total_expected_members IS NULL;
