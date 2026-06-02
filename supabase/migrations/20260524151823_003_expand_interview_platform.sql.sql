/*
  # Expand Interview Schema for Multi-Page Platform

  Enhances the interview schema to support a complete multi-page
  AI interview preparation platform.

  1. Changes to interviews table:
    - Add experience_level column (junior, mid, senior, lead)
    - Add interview_type column (behavioral, technical, mixed)
    - Add detected_skills column (jsonb - AI-detected skills from resume)
    - Add resume_uploaded_at timestamp
    - Add preparation_completed_at timestamp

  2. New Tables:
    - `interview_history`: Tracks all interview attempts for users
      - interview_id (foreign key)
      - user_session_id (text - for demo purposes)
      - viewed_at (timestamp)
*/

-- Add new columns to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'mid' 
CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead'));

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS interview_type text DEFAULT 'mixed' 
CHECK (interview_type IN ('behavioral', 'technical', 'mixed'));

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS detected_skills jsonb DEFAULT '[]'::jsonb;

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS resume_uploaded_at timestamptz;

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS preparation_completed_at timestamptz;

-- Create interview_history table
CREATE TABLE IF NOT EXISTS interview_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_session_id text DEFAULT 'anonymous',
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_history_interview_id ON interview_history(interview_id);
CREATE INDEX IF NOT EXISTS idx_interviews_experience_level ON interviews(experience_level);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_type ON interviews(interview_type);

-- Enable RLS on new table
ALTER TABLE interview_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to interview_history"
  ON interview_history FOR ALL
  USING (true)
  WITH CHECK (true);