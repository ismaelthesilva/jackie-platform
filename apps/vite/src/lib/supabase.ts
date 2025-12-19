// Supabase Client Configuration
// Handles authentication and database operations

import { createClient } from "@supabase/supabase-js";

// Vite exposes env vars via `import.meta.env`. Use VITE_ prefix for public values.
// Keep fallback placeholders so the app doesn't crash during development.
const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Check if Supabase is properly configured
const isSupabaseConfigured =
  supabaseUrl !== "https://placeholder.supabase.co" &&
  supabaseAnonKey !== "placeholder-key";

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️  Supabase not configured for Vite. Create a `.env` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
  console.warn("📝 Example: VITE_SUPABASE_URL=https://xxxx.supabase.co");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface DietPlanRecord {
  id: string;
  user_id: string;
  form_data: Record<string, unknown>;
  diet_plan: Record<string, unknown>;
  status: "draft" | "approved" | "sent";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role === "admin";
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error);
  return !error;
};

export default supabase;
