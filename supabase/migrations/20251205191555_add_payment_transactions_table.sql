/*
  # Payment Transactions Table

  1. New Tables
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reference` (text, unique transaction reference)
      - `amount` (numeric, payment amount)
      - `status` (text, payment status: pending, completed, failed, expired)
      - `virtual_account_number` (text, 9PSB virtual account number)
      - `virtual_account_name` (text, account name)
      - `virtual_account_bank` (text, bank name)
      - `session_id` (text, 9PSB session ID)
      - `expires_at` (timestamptz, when virtual account expires)
      - `completed_at` (timestamptz, when payment was completed)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `payment_transactions` table
    - Add policy for users to view their own transactions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'payment_transactions'
  ) THEN
    CREATE TABLE payment_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      reference text UNIQUE NOT NULL,
      amount numeric NOT NULL CHECK (amount > 0),
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
      virtual_account_number text,
      virtual_account_name text,
      virtual_account_bank text,
      session_id text,
      expires_at timestamptz,
      completed_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
    CREATE INDEX idx_payment_transactions_reference ON payment_transactions(reference);
    CREATE INDEX idx_payment_transactions_virtual_account ON payment_transactions(virtual_account_number);
    CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

    ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own payment transactions"
      ON payment_transactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own payment transactions"
      ON payment_transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;