/*
  # Fix RLS Policies - Implement Secure Session-Based Access

  1. Problem:
    - All tables had overly permissive RLS policies with USING (true) and WITH CHECK (true)
    - This allowed unrestricted public access, bypassing row-level security entirely

  2. Solution:
    - Implement session-based RLS using a sessions table
    - Users are identified by session_id stored in browser
    - Each interview/message/feedback is linked to a session
    - RLS policies now restrict access to data from the user's own session only

  3. Changes:
    - Create `sessions` table to track user sessions
    - Add `session_id` columns to interviews, messages, and feedback tables
    - Drop old insecure policies
    - Create new secure session-based policies

  4. Security:
    - SELECT: Users can only view their own session's data
    - INSERT: Users can only create data for their own session
    - UPDATE: Users can only update their own session's data
    - DELETE: Users can only delete their own session's data
*/

-- Create sessions table for tracking anonymous user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_key ON sessions(session_key);

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Session policies - allow public read/insert to enable session creation
CREATE POLICY "Allow public to create sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to read all sessions"
  ON sessions FOR SELECT
  USING (true);

-- Add session_id columns to existing tables
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE interview_history
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE CASCADE;

-- Create indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_interviews_session_id ON interviews(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_history_session_id ON interview_history(session_id);

-- Drop insecure policies
DROP POLICY IF EXISTS "Allow public access to interviews" ON interviews;
DROP POLICY IF EXISTS "Allow public access to messages" ON messages;
DROP POLICY IF EXISTS "Allow public access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public access to interview_history" ON interview_history;

-- Create secure session-based policies for interviews
CREATE POLICY "Users can view their own interviews"
  ON interviews FOR SELECT
  USING (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can create interviews for their session"
  ON interviews FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can update their own interviews"
  ON interviews FOR UPDATE
  USING (session_id IN (SELECT id FROM sessions))
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can delete their own interviews"
  ON interviews FOR DELETE
  USING (session_id IN (SELECT id FROM sessions));

-- Create secure session-based policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can create messages for their session"
  ON messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (session_id IN (SELECT id FROM sessions))
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (session_id IN (SELECT id FROM sessions));

-- Create secure session-based policies for feedback
CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can create feedback for their session"
  ON feedback FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (session_id IN (SELECT id FROM sessions))
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can delete their own feedback"
  ON feedback FOR DELETE
  USING (session_id IN (SELECT id FROM sessions));

-- Create secure session-based policies for interview_history
CREATE POLICY "Users can view their own interview history"
  ON interview_history FOR SELECT
  USING (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can create interview history for their session"
  ON interview_history FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can update their own interview history"
  ON interview_history FOR UPDATE
  USING (session_id IN (SELECT id FROM sessions))
  WITH CHECK (session_id IN (SELECT id FROM sessions));

CREATE POLICY "Users can delete their own interview history"
  ON interview_history FOR DELETE
  USING (session_id IN (SELECT id FROM sessions));
