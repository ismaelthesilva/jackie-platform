// Global type definitions for Jackie Platform

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: "admin" | "client";
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "admin" | "client";
  created_at: string;
  updated_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  plan_data: any;
  status: "pending" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_type: "fitness" | "nutrition";
  user_email: string;
  form_data: any;
  status: "pending" | "processing" | "completed";
  created_at: string;
}

// Environment variables type safety
export interface EnvironmentVariables {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  OPENAI_API_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
