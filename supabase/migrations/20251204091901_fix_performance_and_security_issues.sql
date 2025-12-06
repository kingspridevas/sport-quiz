/*
  # Fix Performance and Security Issues

  ## 1. Performance Optimizations
  
  ### Add Missing Foreign Key Indexes
  - `questions.created_by` - Index for creator lookups
  - `quiz_answers.question_id` - Index for question-answer joins
  - `wheel_spins.prize_id` - Index for prize-spin lookups
  
  ### Optimize RLS Policies
  - Wrap all `auth.uid()` calls in `(select auth.uid())` to prevent re-evaluation per row
  - This dramatically improves query performance at scale
  - Affects all user-scoped policies across all tables

  ## 2. Security Improvements
  
  ### Fix Function Search Path
  - Set explicit search_path for `create_user_wallet_and_points` function
  - Prevents potential SQL injection via search_path manipulation
  
  ### Consolidate Permissive Policies
  - Combine multiple SELECT policies on `prize_config` and `questions`
  - Makes security model clearer and easier to maintain

  ## 3. Tables Affected
  - profiles
  - wallets
  - wallet_transactions
  - questions
  - quiz_sessions
  - quiz_answers
  - user_points
  - prize_config
  - wheel_spins
  - daily_winner_limits
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_questions_created_by 
  ON questions(created_by);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id 
  ON quiz_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_wheel_spins_prize_id 
  ON wheel_spins(prize_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - WALLETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
CREATE POLICY "Users can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own wallet" ON wallets;
CREATE POLICY "Users can create own wallet"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - WALLET_TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
CREATE POLICY "Users can view own transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create own transactions" ON wallet_transactions;
CREATE POLICY "Users can create own transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - QUESTIONS TABLE
-- =====================================================

-- Drop the duplicate policies and create consolidated ones
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can view active questions" ON questions;

-- Single consolidated SELECT policy
CREATE POLICY "Users can view active questions or admins can see all"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- Admin-only policies for modifications
CREATE POLICY "Admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Admins can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - QUIZ_SESSIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can view own quiz sessions"
  ON quiz_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can create own quiz sessions"
  ON quiz_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can update own quiz sessions"
  ON quiz_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - QUIZ_ANSWERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own quiz answers" ON quiz_answers;
CREATE POLICY "Users can view own quiz answers"
  ON quiz_answers
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create own quiz answers" ON quiz_answers;
CREATE POLICY "Users can create own quiz answers"
  ON quiz_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - USER_POINTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own points" ON user_points;
CREATE POLICY "Users can create own points"
  ON user_points
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own points" ON user_points;
CREATE POLICY "Users can update own points"
  ON user_points
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - PRIZE_CONFIG TABLE
-- =====================================================

-- Drop duplicate policies and create consolidated ones
DROP POLICY IF EXISTS "Admins can manage prize config" ON prize_config;
DROP POLICY IF EXISTS "Authenticated users can view active prizes" ON prize_config;

-- Single consolidated SELECT policy
CREATE POLICY "Users can view active prizes or admins can see all"
  ON prize_config
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- Admin-only policies for modifications
CREATE POLICY "Admins can insert prizes"
  ON prize_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Admins can update prizes"
  ON prize_config
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

CREATE POLICY "Admins can delete prizes"
  ON prize_config
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - WHEEL_SPINS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own wheel spins" ON wheel_spins;
CREATE POLICY "Users can view own wheel spins"
  ON wheel_spins
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own wheel spins" ON wheel_spins;
CREATE POLICY "Users can create own wheel spins"
  ON wheel_spins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - DAILY_WINNER_LIMITS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage daily limits" ON daily_winner_limits;
CREATE POLICY "Admins can manage daily limits"
  ON daily_winner_limits
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = (select auth.uid())) = true
  );

-- =====================================================
-- 12. FIX FUNCTION SEARCH PATH
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_wallet_and_points()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create wallet for the new user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  -- Create user_points record
  INSERT INTO public.user_points (user_id, points_balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;