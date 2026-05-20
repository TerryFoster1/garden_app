import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { Database, SupabaseConfig } from "./types";

export function getSupabaseConfig(): SupabaseConfig {
  const enabled = process.env.EXPO_PUBLIC_ENABLE_SUPABASE === "true";
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!enabled || !url || !anonKey) {
    return {
      mode: "disabled",
      url,
      anonKey
    };
  }

  return {
    mode: "enabled",
    url,
    anonKey
  };
}

export function createPattypanSupabaseClient(config = getSupabaseConfig()): SupabaseClient<Database> | null {
  if (config.mode !== "enabled" || !config.url || !config.anonKey) {
    return null;
  }

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

export const supabase = createPattypanSupabaseClient();
export const isSupabaseEnabled = getSupabaseConfig().mode === "enabled";
