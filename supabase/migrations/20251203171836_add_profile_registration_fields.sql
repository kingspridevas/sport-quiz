/*
  # Add Extended Profile Registration Fields

  1. New Columns
    - `sex` (text) - User's gender (Male/Female)
    - `phone_number` (text) - User's phone number
    - `location` (text) - User's location/address
    - `photo_url` (text) - URL to user's profile photo stored in Supabase Storage

  2. Changes
    - Add new columns to profiles table with appropriate constraints
    - All fields are optional (nullable) to support existing users
    - Add check constraint for sex field to only allow 'Male' or 'Female'

  3. Security
    - Users can update their own profile fields
    - RLS policies already in place will cover these new fields
*/

-- Add sex field with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sex'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sex text;
    ALTER TABLE profiles ADD CONSTRAINT sex_check CHECK (sex IN ('Male', 'Female'));
  END IF;
END $$;

-- Add phone_number field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Add location field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;
END $$;

-- Add photo_url field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo_url text;
  END IF;
END $$;
