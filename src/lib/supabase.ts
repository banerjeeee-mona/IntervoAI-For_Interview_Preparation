import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session management for RLS
const SESSION_KEY_STORAGE = 'intervo_session_key';

export function getOrCreateSessionKey(): string {
  let key = localStorage.getItem(SESSION_KEY_STORAGE);
  if (!key) {
    key = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_KEY_STORAGE, key);
  }
  return key;
}

export function getSessionKey(): string {
  return localStorage.getItem(SESSION_KEY_STORAGE) || '';
}

export async function initializeSession(): Promise<string> {
  const sessionKey = getOrCreateSessionKey();

  // Check if session exists
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('session_key', sessionKey)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Create new session
  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_key: sessionKey })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to initialize session:', error);
    throw error;
  }

  return data.id;
}

export type Interview = {
  id: string;
  resume_text: string;
  role: string;
  status: 'pending' | 'active' | 'completed';
  started_at: string;
  ended_at: string | null;
  created_at: string;
  session_id?: string;
};

export type Message = {
  id: string;
  interview_id: string;
  role: 'ai' | 'user';
  content: string;
  created_at: string;
  session_id?: string;
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
  session_id?: string;
};
