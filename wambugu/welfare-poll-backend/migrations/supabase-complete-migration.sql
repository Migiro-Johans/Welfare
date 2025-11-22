-- ============================================
-- SUPABASE COMPLETE MIGRATION
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- This creates all tables, indexes, and initial data

-- ============================================
-- 1. CREATE MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  password_reset_by INTEGER REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);

-- ============================================
-- 2. CREATE VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  vote_option INTEGER CHECK (vote_option IN (1, 2)) NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  vote_hash VARCHAR(255),
  previous_vote INTEGER CHECK (previous_vote IN (1, 2)),
  UNIQUE(member_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_member ON votes(member_id);
CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(vote_option);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);

-- ============================================
-- 3. CREATE POLL_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_settings (
  id SERIAL PRIMARY KEY,
  is_open BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  minimum_votes_option2 INTEGER DEFAULT 150,
  total_expected_members INTEGER DEFAULT 300,
  poll_title VARCHAR(500) DEFAULT 'WELFARE MEMBERS POLL',
  poll_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. CREATE AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_member ON audit_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ============================================
-- 5. CREATE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(is_sent);

-- ============================================
-- 6. INSERT DEFAULT POLL SETTINGS
-- ============================================
INSERT INTO poll_settings (
  is_open,
  poll_title,
  minimum_votes_option2,
  total_expected_members
)
VALUES (
  TRUE,
  'WELFARE MEMBERS POLL — PLEASE VOTE',
  150,
  300
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. CREATE ADMIN USER
-- ============================================
-- Default password: admin123
-- IMPORTANT: Change this password after first login!
INSERT INTO members (
  member_id,
  email,
  phone,
  full_name,
  password_hash,
  is_admin,
  is_active,
  email_verified,
  created_at,
  updated_at
)
VALUES (
  'ADMIN001',
  'admin@welfare.com',
  '+254712345678',
  'System Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5HlFpj6jQ3xWu',
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Verify by running:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT member_id, email, is_admin FROM members WHERE email = 'admin@welfare.com';
