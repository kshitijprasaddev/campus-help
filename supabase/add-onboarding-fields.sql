-- Add onboarding_completed column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_method TEXT;

-- Update existing profiles to mark onboarding as completed if they have a name
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE full_name IS NOT NULL AND full_name != '';
