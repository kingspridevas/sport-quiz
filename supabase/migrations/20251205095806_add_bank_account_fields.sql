/*
  # Add Bank Account Fields to Profiles

  1. Changes
    - Add `bank_account_number` column to store user's bank account number
    - Add `bank_account_name` column to store the account holder's name
    - Add `bank_name` column to store the bank name
    - Add `account_verified` column to track if the bank account has been verified
    
  2. Security
    - These fields are part of the profiles table which already has RLS enabled
    - Users can only view and update their own bank account information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bank_account_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_account_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bank_account_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_account_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_verified boolean DEFAULT false;
  END IF;
END $$;