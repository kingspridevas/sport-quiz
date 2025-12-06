/*
  # Remove Option D from correct_answer constraint

  1. Changes
    - Drop the old constraint that allows A, B, C, D
    - Add a new constraint that only allows A, B, C
  
  2. Security
    - No RLS changes needed (existing policies remain)
*/

-- Drop the old constraint
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_correct_answer_check;

-- Add new constraint with only A, B, C
ALTER TABLE questions 
ADD CONSTRAINT questions_correct_answer_check 
CHECK (correct_answer = ANY (ARRAY['A'::text, 'B'::text, 'C'::text]));