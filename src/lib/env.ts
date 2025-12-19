// Environment variable validation and type-safe access

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
] as const;

const optionalEnvVars = [
  "TURNSTILE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/**
 * Validates required environment variables are present
 * Call this in your root layout or _app to fail fast
 */
export function validateEnv() {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file."
    );
  }
}

/**
 * Type-safe environment variable access
 */
export const env = {
  // Public (client-side)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    secretKey: process.env.TURNSTILE_SECRET_KEY || "",
  },
  // Private (server-side only)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

/**
 * Check if a specific feature is enabled based on env vars
 */
export const features = {
  auth: !!env.supabase.url && !!env.supabase.anonKey,
  turnstile: !!env.turnstile.siteKey,
  aiGeneration: !!env.openai.apiKey,
} as const;
