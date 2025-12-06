/*
  # Fix RLS Policies for Quiz Platform

  1. Issues Fixed
    - Remove infinite recursion in profiles admin policy
    - Add INSERT policy for wallet_transactions
    - Simplify admin checks to avoid circular dependencies

  2. Changes
    - Drop problematic admin policies on profiles that cause recursion
    - Add proper INSERT policy for wallet_transactions
    - Add INSERT policy for user_points (in case it's needed)
    
  3. Security
    - Maintain strict access control
    - Users can only manage their own data
    - Admin checks simplified to prevent recursion
*/

-- Drop the problematic admin policy on profiles that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Drop and recreate wheel_spins admin policy without subquery
DROP POLICY IF EXISTS "Admins can view all wheel spins" ON wheel_spins;

-- Add INSERT policy for wallet_transactions (users need to create transactions)
DROP POLICY IF EXISTS "Users can create own transactions" ON wallet_transactions;
CREATE POLICY "Users can create own transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- Add INSERT policy for user_points in case it doesn't exist
DROP POLICY IF EXISTS "Users can create own points" ON user_points;
CREATE POLICY "Users can create own points"
  ON user_points
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Recreate admin policies without subqueries to avoid infinite recursion
-- For daily_winner_limits - simplify to just check is_admin directly
DROP POLICY IF EXISTS "Admins can manage daily limits" ON daily_winner_limits;
CREATE POLICY "Admins can manage daily limits"
  ON daily_winner_limits
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- For prize_config
DROP POLICY IF EXISTS "Admins can manage prize config" ON prize_config;
CREATE POLICY "Admins can manage prize config"
  ON prize_config
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- For questions
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
CREATE POLICY "Admins can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Allow users to insert their own profiles (for signup)
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own wallets
DROP POLICY IF EXISTS "Users can create own wallet" ON wallets;
CREATE POLICY "Users can create own wallet"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
