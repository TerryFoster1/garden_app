import type { SupabaseClient } from "@supabase/supabase-js";

import type { GardenHomeModel, PlantInstance, PlantPhoto } from "../../domain";
import { supabase } from "./client";
import type { Database } from "./types";

export type GardenRepositoryAdapter = {
  mode: "local-alpha" | "supabase";
  loadGardenModel(userId: string): Promise<GardenHomeModel | null>;
  saveProfile(input: { userId: string; displayName: string; locationLabel: string; latitude?: number; longitude?: number }): Promise<void>;
  upsertPlantInstance(plant: PlantInstance): Promise<void>;
  addPlantPhoto(photo: PlantPhoto): Promise<void>;
};

export function createSupabaseGardenRepositoryAdapter(client: SupabaseClient<Database> | null = supabase): GardenRepositoryAdapter {
  if (!client) {
    return disabledGardenRepositoryAdapter;
  }

  return {
    mode: "supabase",
    async loadGardenModel() {
      // Future adapter boundary. The local alpha repository remains the runtime source of truth.
      return null;
    },
    async saveProfile(input) {
      const profile: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: input.userId,
        display_name: input.displayName,
        location_label: input.locationLabel,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        updated_at: new Date().toISOString()
      };
      const profileClient = client as unknown as { from: (table: "profiles") => { upsert: (value: typeof profile) => Promise<unknown> } };
      await profileClient.from("profiles").upsert(profile);
    },
    async upsertPlantInstance() {
      throw new Error("Supabase plant sync is not enabled yet. Local alpha persistence remains active.");
    },
    async addPlantPhoto() {
      throw new Error("Supabase photo sync is not enabled yet. Local alpha photo storage remains active.");
    }
  };
}

export const disabledGardenRepositoryAdapter: GardenRepositoryAdapter = {
  mode: "local-alpha",
  async loadGardenModel() {
    return null;
  },
  async saveProfile() {
    return;
  },
  async upsertPlantInstance() {
    return;
  },
  async addPlantPhoto() {
    return;
  }
};

export const supabaseGardenRepositoryAdapter = createSupabaseGardenRepositoryAdapter();
