/*
  # Expand Interview Roles to All Professions

  Updates the interview schema to support a wider range of professions
  across all industries, not just IT/software fields.

  1. Changes:
    - Updates the role constraint to include all profession types
    - Previous roles remain supported for backward compatibility

  2. New Professions Added:
    - Technology: Software Engineer, Data Analyst, Data Scientist, Web Developer, UI/UX Designer
    - Business: Product Manager, Digital Marketing, Sales, Customer Support, Business Analyst
    - Corporate: HR, Finance, Banking
    - Healthcare: Doctor, Nurse
    - Legal: Lawyer
    - Education: Teacher
    - Creative: Content Creator, Journalist
    - Engineering: Mechanical Engineer, Electrical Engineer, Civil Services
    - Service: Hotel Management
    - General: General Mock Interview
*/

-- First, drop the existing constraint if it exists
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'interviews'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%software_engineer%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE interviews DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Add updated constraint with all profession options
ALTER TABLE interviews ADD CONSTRAINT valid_interview_role
  CHECK (role IN (
    'software_engineer',
    'data_analyst',
    'data_scientist',
    'web_developer',
    'ui_ux_designer',
    'product_manager',
    'digital_marketing',
    'hr',
    'finance',
    'sales',
    'customer_support',
    'teacher',
    'doctor',
    'nurse',
    'lawyer',
    'business_analyst',
    'content_creator',
    'journalist',
    'civil_services',
    'mechanical_engineer',
    'electrical_engineer',
    'hotel_management',
    'banking',
    'general'
  ));