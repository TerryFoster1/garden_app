import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "./client";
import type { Database } from "./types";

export type PublicBetaAuthSession = {
  userId: string;
  email?: string;
  displayName?: string;
};

export type PublicBetaAuthResult =
  | { ok: true; session: PublicBetaAuthSession }
  | { ok: false; error: string };

export type PublicBetaAuthAdapter = {
  mode: "local-alpha" | "supabase";
  signUp(input: { email: string; password: string; displayName: string }): Promise<PublicBetaAuthResult>;
  signIn(input: { email: string; password: string }): Promise<PublicBetaAuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<PublicBetaAuthSession | null>;
};

export function createSupabaseAuthAdapter(client: SupabaseClient<Database> | null = supabase): PublicBetaAuthAdapter {
  if (!client) {
    return disabledAuthAdapter;
  }

  return {
    mode: "supabase",
    async signUp(input) {
      const { data, error } = await client.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          data: {
            display_name: input.displayName.trim()
          }
        }
      });

      if (error || !data.user) {
        return { ok: false, error: error?.message ?? "Supabase sign-up did not return a user." };
      }

      return {
        ok: true,
        session: {
          userId: data.user.id,
          email: data.user.email ?? input.email.trim().toLowerCase(),
          displayName: input.displayName.trim()
        }
      };
    },
    async signIn(input) {
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password
      });

      if (error || !data.user) {
        return { ok: false, error: error?.message ?? "Supabase sign-in did not return a user." };
      }

      return {
        ok: true,
        session: {
          userId: data.user.id,
          email: data.user.email ?? input.email.trim().toLowerCase(),
          displayName: typeof data.user.user_metadata?.display_name === "string" ? data.user.user_metadata.display_name : undefined
        }
      };
    },
    async signOut() {
      await client.auth.signOut();
    },
    async getSession() {
      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        displayName: typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : undefined
      };
    }
  };
}

export const disabledAuthAdapter: PublicBetaAuthAdapter = {
  mode: "local-alpha",
  async signUp() {
    return { ok: false, error: "Supabase auth is disabled. Local alpha auth remains active." };
  },
  async signIn() {
    return { ok: false, error: "Supabase auth is disabled. Local alpha auth remains active." };
  },
  async signOut() {
    return;
  },
  async getSession() {
    return null;
  }
};

export const supabaseAuthAdapter = createSupabaseAuthAdapter();
