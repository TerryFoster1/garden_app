# Supabase Schema Plan

This schema is the first public-beta database shape for Pattypan. It mirrors the current local domain model without forcing migration yet.

## Modes

- Local alpha mode: default. `EXPO_PUBLIC_ENABLE_SUPABASE=false`; the app keeps using local prototype auth and local persistence.
- Supabase public-beta mode: future. `EXPO_PUBLIC_ENABLE_SUPABASE=true`; auth, cloud sync, private photo storage, entitlement state, and secure provider calls are moved to Supabase-backed services.

## Planned Tables

### `profiles`

One row per Supabase auth user.

Fields:
- `id`: equals `auth.users.id`.
- `email`
- `display_name`
- `location_label`
- `latitude`
- `longitude`
- timestamps

### `gardens`

User-owned indoor/outdoor garden containers.

Fields:
- `user_id`
- `name`
- `kind`
- `location_label`
- `notes`

### `garden_beds`

User-owned beds, pots, containers, greenhouse beds, and in-ground beds.

Fields:
- `user_id`
- `garden_id`
- `name`
- `type`
- `length_feet`
- `width_feet`
- `depth_inches`
- `soil_type`
- `sun_exposure`

### `plant_species_cache`

Shared plant species cache. This can hold local/search/API-enriched plant knowledge without tying generic plant knowledge to one user.

Readable by authenticated users. Writes should be service-role/admin only.

### `plant_instances`

A specific living plant owned by the user.

Example: `Cherry Bomb Tomato` in `Raised Bed 1`.

Fields:
- `user_id`
- `garden_id`
- `bed_id`
- `species_id`
- `display_name`
- `location_type`
- `stage`
- `planted_on`
- `current_profile_photo_id`
- `position_x_percent`
- `position_y_percent`
- `notes`

### `plant_photos`

Private user-owned plant and diagnosis photos.

Fields:
- `user_id`
- `plant_instance_id`
- `storage_path`
- `purpose`
- `note`
- `taken_at`

Storage bucket should be private and path-scoped by user id.

### `diagnoses`

Photo and symptom-linked diagnosis events.

Fields:
- `user_id`
- `plant_instance_id`
- `photo_id`
- `symptoms`
- `summary`
- `confidence`
- `provider`

### `care_tasks`

Care, weather, diagnosis, and harvest tasks.

Fields:
- `user_id`
- `plant_instance_id`
- `garden_bed_id`
- `type`
- `title`
- `due_at`
- `priority`
- `status`
- `reason`

### `weather_snapshots`

Cached weather payloads for user location and garden action derivation.

Fields:
- `user_id`
- `location_label`
- `captured_at`
- `payload`

### `subscriptions`

Stripe-derived subscription state. Webhooks are source of truth.

Fields:
- `user_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `status`
- `current_period_ends_at`
- `cancel_at_period_end`

### `entitlement_overrides`

Manual access overrides for admin, lifetime, and comped users.

Writes should be admin/service-role only.

Fields:
- `user_id`
- `account_state`
- `reason`
- `created_by`

## Repository Plan

Current default:
- Local repository and local persistence remain active.

Next adapter:
- Add a Supabase repository adapter behind a feature flag.
- Keep method shapes close to current local model operations: load model, save profile, upsert garden, upsert bed, upsert plant, add photo, add diagnosis, update task.
- Do not force migration until sign-in and cloud sync are stable.

