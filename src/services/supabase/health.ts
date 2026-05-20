import { supabase } from "./client";
import type { SupabaseConfig } from "./types";
import { getSupabaseConfig } from "./client";

export type SupabaseBridgeStatus = {
  enabled: boolean;
  configured: boolean;
  label: "disabled" | "missing config" | "configured" | "session ready" | "unavailable";
  detail: string;
};

export function getSupabaseBridgeStatus(config: SupabaseConfig = getSupabaseConfig()): SupabaseBridgeStatus {
  const configured = Boolean(config.url && config.anonKey);

  if (config.mode !== "enabled") {
    return {
      enabled: false,
      configured,
      label: "disabled",
      detail: configured ? "Supabase env is present but bridge mode is off." : "Local alpha mode is active."
    };
  }

  if (!configured) {
    return {
      enabled: true,
      configured: false,
      label: "missing config",
      detail: "Set Supabase URL and anon key before enabling bridge mode."
    };
  }

  return {
    enabled: true,
    configured: true,
    label: "configured",
    detail: "Supabase bridge is configured. Local persistence remains active until repository sync is wired."
  };
}

export async function checkSupabaseSessionHealth(): Promise<SupabaseBridgeStatus> {
  const status = getSupabaseBridgeStatus();
  if (!status.enabled || !status.configured || !supabase) {
    return status;
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        ...status,
        label: "unavailable",
        detail: "Supabase client is configured, but session check failed."
      };
    }

    return {
      ...status,
      label: "session ready",
      detail: "Supabase client can read session state. Data sync is still disabled."
    };
  } catch {
    return {
      ...status,
      label: "unavailable",
      detail: "Supabase client is configured, but health check could not complete."
    };
  }
}
