/*
  # Interview Simulator Database Schema

  Creates the foundation for an AI-powered interview simulator with voice interaction.

  1. New Tables
    - `interviews`: Stores interview sessions with resume content and role information
      - `id` (uuid, primary key)
      - `resume_text` (text, stores parsed resume content)
      - `role` (text, interview role type)
      - `status` (text, current interview state)
      - `started_at` (timestamp)
      - `ended_at` (timestamp, nullable)
      - `created_at` (timestamp)
    
    - `messages`: Conversation transcript between AI and user
      - `id` (uuid, primary key)
      - `interview_id` (uuid, foreign key)
      - `role` (text, 'ai' or 'user')
      - `content` (text, message content)
      - `created_at` (timestamp)
    
    - `feedback`: AI-generated feedback for completed interviews
      - `id` (uuid, primary key)
      - `interview_id` (uuid, foreign key)
      - `communication_score` (integer, 0-100)
      - `technical_score` (integer, 0-100)
      - `confidence_score` (integer, 0-100)
      - `overall_score` (integer, 0-100)
      - `strengths` (jsonb, array of strengths)
      - `improvements` (jsonb, array of improvement areas)
      - `summary` (text, overall feedback summary)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies allow public access (demo application)
    - No user authentication required for simplicity
*/

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_text text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'software_engineer',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Messages table for conversation transcript
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ai', 'user')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Feedback table for interview results
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  communication_score integer DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
  technical_score integer DEFAULT 0 CHECK (technical_score >= 0 AND technical_score <= 100),
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths jsonb DEFAULT '[]'::jsonb,
  improvements jsonb DEFAULT '[]'::jsonb,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_interview_id ON messages(interview_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interview_id ON feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo application)
CREATE POLICY "Allow public access to interviews"
  ON interviews FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to messages"
  ON messages FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to feedback"
  ON feedback FOR ALL
  USING (true)
  WITH CHECK (true);