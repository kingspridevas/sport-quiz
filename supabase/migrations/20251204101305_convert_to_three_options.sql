/*
  # Convert Quiz to Three Options (A, B, C)

  1. Changes
    - Moves questions with correct answer D to option C
    - Removes option_d column from questions table
    - Redistributes all correct answers across A, B, and C only

  2. Security
    - No changes to RLS policies
*/

-- First, move all D answers to C position
UPDATE questions 
SET 
  option_c = option_d,
  correct_answer = 'C'
WHERE correct_answer = 'D';

-- Now remove the option_d column
ALTER TABLE questions DROP COLUMN IF EXISTS option_d;