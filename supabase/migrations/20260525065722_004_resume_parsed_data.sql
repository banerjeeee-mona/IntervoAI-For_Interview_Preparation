/*
  # Add parsed resume data columns to interviews table

  1. Changes to interviews table:
    - `parsed_education` (jsonb) - Education credentials extracted from resume
    - `parsed_projects` (jsonb) - Projects extracted from resume
    - `parsed_profession` (text) - Auto-detected profession/domain from resume
    - `resume_filename` (text) - Original uploaded file name
    - `generated_questions` (jsonb) - Dynamically generated interview questions based on resume

  2. Notes:
    - All new columns are nullable with safe defaults
    - No destructive changes
    - Existing records remain unaffected
*/

ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS parsed_education jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS parsed_projects jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS parsed_profession text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS resume_filename text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS generated_questions jsonb DEFAULT '[]'::jsonb;
