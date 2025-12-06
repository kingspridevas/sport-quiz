/*
  # Add Multi-Language Support

  1. Changes to Tables
    - `questions`
      - Add `question_text_yoruba` (text) - Yoruba translation
      - Add `question_text_hausa` (text) - Hausa translation
      - Add `question_text_igbo` (text) - Igbo translation
      - Add `option_a_yoruba` (text) - Yoruba translation for option A
      - Add `option_a_hausa` (text) - Hausa translation for option A
      - Add `option_a_igbo` (text) - Igbo translation for option A
      - Add `option_b_yoruba` (text) - Yoruba translation for option B
      - Add `option_b_hausa` (text) - Hausa translation for option B
      - Add `option_b_igbo` (text) - Igbo translation for option B
      - Add `option_c_yoruba` (text) - Yoruba translation for option C
      - Add `option_c_hausa` (text) - Hausa translation for option C
      - Add `option_c_igbo` (text) - Igbo translation for option C
    
    - `profiles`
      - Add `preferred_language` (text) - User's language preference (english, yoruba, hausa, igbo)
      - Default to 'english'

  2. Notes
    - Existing `question_text`, `option_a`, `option_b`, `option_c` columns remain as English versions
    - All translation columns allow NULL initially to avoid breaking existing data
    - Language preference is stored in user profile for persistent experience
*/

-- Add language translation columns to questions table
DO $$
BEGIN
  -- Question text translations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'question_text_yoruba'
  ) THEN
    ALTER TABLE questions ADD COLUMN question_text_yoruba text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'question_text_hausa'
  ) THEN
    ALTER TABLE questions ADD COLUMN question_text_hausa text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'question_text_igbo'
  ) THEN
    ALTER TABLE questions ADD COLUMN question_text_igbo text;
  END IF;

  -- Option A translations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_a_yoruba'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_a_yoruba text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_a_hausa'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_a_hausa text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_a_igbo'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_a_igbo text;
  END IF;

  -- Option B translations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_b_yoruba'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_b_yoruba text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_b_hausa'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_b_hausa text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_b_igbo'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_b_igbo text;
  END IF;

  -- Option C translations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_c_yoruba'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_c_yoruba text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_c_hausa'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_c_hausa text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_c_igbo'
  ) THEN
    ALTER TABLE questions ADD COLUMN option_c_igbo text;
  END IF;
END $$;

-- Add language preference to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_language text DEFAULT 'english';
  END IF;
END $$;

-- Add check constraint for valid language values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_preferred_language_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_preferred_language_check 
    CHECK (preferred_language IN ('english', 'yoruba', 'hausa', 'igbo'));
  END IF;
END $$;