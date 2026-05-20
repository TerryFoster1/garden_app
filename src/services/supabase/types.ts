export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SupabaseMode = "disabled" | "enabled";

export type SupabaseConfig = {
  mode: SupabaseMode;
  url?: string;
  anonKey?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          location_label: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      gardens: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: string;
          location_label: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gardens"]["Row"]> & { user_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["gardens"]["Row"]>;
      };
      garden_beds: {
        Row: {
          id: string;
          user_id: string;
          garden_id: string;
          name: string;
          type: string;
          length_feet: number;
          width_feet: number;
          depth_inches: number | null;
          soil_type: string | null;
          sun_exposure: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["garden_beds"]["Row"]> & { user_id: string; garden_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["garden_beds"]["Row"]>;
      };
      plant_species_cache: {
        Row: {
          id: string;
          common_name: string;
          scientific_name: string | null;
          category: string | null;
          care: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["plant_species_cache"]["Row"]> & { common_name: string };
        Update: Partial<Database["public"]["Tables"]["plant_species_cache"]["Row"]>;
      };
      plant_instances: {
        Row: {
          id: string;
          user_id: string;
          garden_id: string;
          bed_id: string | null;
          species_id: string | null;
          display_name: string;
          location_type: string;
          stage: string | null;
          planted_on: string | null;
          current_profile_photo_id: string | null;
          position_x_percent: number | null;
          position_y_percent: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["plant_instances"]["Row"]> & { user_id: string; garden_id: string; display_name: string };
        Update: Partial<Database["public"]["Tables"]["plant_instances"]["Row"]>;
      };
      plant_photos: {
        Row: {
          id: string;
          user_id: string;
          plant_instance_id: string | null;
          storage_path: string;
          purpose: string;
          note: string | null;
          taken_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["plant_photos"]["Row"]> & { user_id: string; storage_path: string; purpose: string };
        Update: Partial<Database["public"]["Tables"]["plant_photos"]["Row"]>;
      };
      diagnoses: {
        Row: {
          id: string;
          user_id: string;
          plant_instance_id: string | null;
          photo_id: string | null;
          symptoms: string[];
          summary: string;
          confidence: string | null;
          provider: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["diagnoses"]["Row"]> & { user_id: string; summary: string };
        Update: Partial<Database["public"]["Tables"]["diagnoses"]["Row"]>;
      };
      care_tasks: {
        Row: {
          id: string;
          user_id: string;
          plant_instance_id: string | null;
          garden_bed_id: string | null;
          type: string;
          title: string;
          due_at: string;
          priority: string;
          status: string;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["care_tasks"]["Row"]> & { user_id: string; title: string; type: string; due_at: string };
        Update: Partial<Database["public"]["Tables"]["care_tasks"]["Row"]>;
      };
      weather_snapshots: {
        Row: {
          id: string;
          user_id: string;
          location_label: string;
          captured_at: string;
          payload: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["weather_snapshots"]["Row"]> & { user_id: string; location_label: string; payload: Json };
        Update: Partial<Database["public"]["Tables"]["weather_snapshots"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          current_period_ends_at: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { user_id: string; status: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      entitlement_overrides: {
        Row: {
          id: string;
          user_id: string;
          account_state: string;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["entitlement_overrides"]["Row"]> & { user_id: string; account_state: string };
        Update: Partial<Database["public"]["Tables"]["entitlement_overrides"]["Row"]>;
      };
    };
  };
};
