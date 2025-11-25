-- Migration: Add password reset fields to members table
-- Date: 2025-11-18

-- Add password reset token and expiry fields
DO $$
BEGIN
    -- Add reset_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'reset_token'
    ) THEN
        ALTER TABLE members
        ADD COLUMN reset_token VARCHAR(255);
    END IF;

    -- Add reset_token_expires column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'reset_token_expires'
    ) THEN
        ALTER TABLE members
        ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add password_reset_by column (for admin resets)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'password_reset_by'
    ) THEN
        ALTER TABLE members
        ADD COLUMN password_reset_by INTEGER REFERENCES members(id);
    END IF;
END $$;

-- Create index on reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_reset_token ON members(reset_token);
