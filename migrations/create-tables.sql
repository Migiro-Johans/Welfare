-- Note: Database should already exist (created by Supabase/Docker)
-- Skip CREATE DATABASE for Supabase/managed databases

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_member_id ON members(member_id);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  vote_option INTEGER CHECK (vote_option IN (1, 2)) NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  vote_hash VARCHAR(255),
  previous_vote INTEGER CHECK (previous_vote IN (1, 2)),
  UNIQUE(member_id)
);

CREATE INDEX idx_votes_member ON votes(member_id);
CREATE INDEX idx_votes_option ON votes(vote_option);
CREATE INDEX idx_votes_voted_at ON votes(voted_at);

-- Create poll_settings table
CREATE TABLE IF NOT EXISTS poll_settings (
  id SERIAL PRIMARY KEY,
  is_open BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  minimum_votes_option2 INTEGER DEFAULT 150,
  poll_title VARCHAR(500) DEFAULT 'WELFARE MEMBERS POLL',
  poll_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_member ON audit_logs(member_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_member ON notifications(member_id);
CREATE INDEX idx_notifications_sent ON notifications(is_sent);

-- Insert default poll settings
INSERT INTO poll_settings (is_open, poll_title, minimum_votes_option2)
VALUES (TRUE, 'WELFARE MEMBERS POLL — PLEASE VOTE', 150)
ON CONFLICT DO NOTHING;
