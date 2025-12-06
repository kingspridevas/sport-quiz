/*
  # Redistribute Correct Answers Across All Options

  1. Changes
    - Reorganizes question options so correct answers are distributed evenly across A, B, C, and D
    - Maintains the actual correct answer content but changes which option letter it appears under
    - Creates a more challenging and unpredictable quiz experience

  2. Security
    - No changes to RLS policies
*/

-- Update questions to have varied correct answer positions
-- Moving some answers from B to A
UPDATE questions SET 
  option_a = option_b,
  option_b = option_a,
  correct_answer = 'A'
WHERE id IN (
  SELECT id FROM questions 
  WHERE correct_answer = 'B' 
  ORDER BY created_at 
  LIMIT 30
);

-- Moving some answers from B to C
UPDATE questions SET 
  option_c = option_b,
  option_b = option_c,
  correct_answer = 'C'
WHERE id IN (
  SELECT id FROM questions 
  WHERE correct_answer = 'B' 
  ORDER BY created_at 
  LIMIT 25
);

-- Moving some answers from B to D
UPDATE questions SET 
  option_d = option_b,
  option_b = option_d,
  correct_answer = 'D'
WHERE id IN (
  SELECT id FROM questions 
  WHERE correct_answer = 'B' 
  ORDER BY created_at 
  LIMIT 20
);