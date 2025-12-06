/*
  # Fix Wallet and Points Creation Trigger

  1. Problem
    - The `create_user_wallet_and_points` function references wrong column names
    - Column `points_balance` doesn't exist in `user_points` table
    - Correct column name is `points`

  2. Solution
    - Update the trigger function to use correct column names
    - Maintain security with SECURITY DEFINER and explicit search_path
*/

CREATE OR REPLACE FUNCTION create_user_wallet_and_points()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  INSERT INTO public.user_points (user_id, points, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$$;