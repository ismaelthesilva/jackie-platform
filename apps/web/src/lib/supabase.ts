// Supabase Client Configuration
// Handles authentication and database operations

import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn('⚠️  Supabase not configured. Please create a .env file with your Supabase credentials.');
  console.warn('📝 Copy .env.example to .env and fill in your Supabase URL and API key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test database connectivity (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection test successful');
    }
  }).catch((error) => {
    console.error('Supabase connection test error:', error);
  });
}

// Database types for TypeScript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface DietPlanRecord {
  id: string;
  user_id: string;
  form_data: any;
  diet_plan: any;
  status: 'draft' | 'approved' | 'sent';
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  review_notes?: string;
  sent_at?: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role === 'admin';
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
  return !error;
};

export default supabase;
