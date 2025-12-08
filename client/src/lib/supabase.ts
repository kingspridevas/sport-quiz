import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oqpsdlpylnawuycqondv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHNkbHB5bG5hd3V5Y3FvbmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDI1OTksImV4cCI6MjA4MDMxODU5OX0.PWbPkcvQUYPL8HDa96m9_AciQQzE2NxulkLG2ajkVTg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  sex: string | null;
  phone_number: string | null;
  location: string | null;
  photo_url: string | null;
  preferred_language: 'english' | 'yoruba' | 'hausa' | 'igbo';
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  account_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_funded: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  question_text_yoruba?: string | null;
  question_text_hausa?: string | null;
  question_text_igbo?: string | null;
  option_a_yoruba?: string | null;
  option_a_hausa?: string | null;
  option_a_igbo?: string | null;
  option_b_yoruba?: string | null;
  option_b_hausa?: string | null;
  option_b_igbo?: string | null;
  option_c_yoruba?: string | null;
  option_c_hausa?: string | null;
  option_c_igbo?: string | null;
  correct_answer: 'A' | 'B' | 'C';
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  correct_answers: number;
  total_questions: number;
  points_earned: number;
  started_at: string;
  completed_at: string | null;
}

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export interface PrizeConfig {
  id: string;
  prize_name: string;
  prize_type: 'cash' | 'item' | 'retry' | 'draw' | 'thank_you';
  prize_value: number | null;
  daily_limit: number | null;
  probability_weight: number;
  is_active: boolean;
  created_at: string;
}

export interface WheelSpin {
  id: string;
  user_id: string;
  prize_id: string;
  prize_name: string;
  prize_value: number | null;
  status: 'pending' | 'claimed' | 'processed';
  spun_at: string;
}
