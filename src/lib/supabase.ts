import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Interview = {
  id: string;
  resume_text: string;
  role: string;
  status: 'pending' | 'active' | 'completed';
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  interview_id: string;
  role: 'ai' | 'user';
  content: string;
  created_at: string;
};

export type Feedback = {
  id: string;
  interview_id: string;
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  created_at: string;
};
