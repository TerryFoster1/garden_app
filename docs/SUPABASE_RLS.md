# Supabase RLS Plan

Row Level Security is mandatory before public beta. UI hiding is not enough.

## Core Principles

- Users can only read and write their own garden data.
- Generic plant species cache can be readable by authenticated users.
- Plant species cache writes should be admin/service-role only.
- Subscriptions are readable by the owning user but writable only by Stripe webhook/service-role code.
- Entitlement overrides are admin/service-role only.
- Plant photo storage is private by user.

## Table Policies

### `profiles`

- Users can select their own profile.
- Users can insert their own profile during onboarding.
- Users can update their own profile.
- No user can read another user's profile.

### `gardens`, `garden_beds`, `plant_instances`, `plant_photos`, `diagnoses`, `care_tasks`, `weather_snapshots`

- Select: `auth.uid() = user_id`
- Insert: `auth.uid() = user_id`
- Update: `auth.uid() = user_id`
- Delete: `auth.uid() = user_id`

### `plant_species_cache`

- Select: authenticated users.
- Insert/update/delete: service role only in the first beta pass.

### `subscriptions`

- Select: `auth.uid() = user_id`
- Insert/update/delete: service role only.

Stripe webhooks must update this table from a trusted function. The client should never write subscription state.

### `entitlement_overrides`

- Select: service role/admin only in the first beta pass.
- Insert/update/delete: service role/admin only.

The client can receive effective entitlements from a secure function or a view later, but should not be able to grant itself premium/admin/lifetime/comped.

## Storage Policy

Create private bucket:
- `plant-photos`

Recommended path:
- `{user_id}/{plant_instance_id}/{photo_id}.jpg`

Policies:
- Users can read objects whose first path segment equals their auth uid.
- Users can upload to their own path.
- Users can delete their own objects.
- Service role can read for provider proxy/diagnosis flows.

Future photo display should use short-lived signed URLs. Do not make `plant-photos` public for beta.

## Server Function Trust Boundary

Supabase Edge Functions or Vercel server routes should use service role only for trusted operations:

- Stripe webhook updates.
- Provider proxy calls.
- Monthly usage counters.
- Admin entitlement overrides.
- Plant species cache enrichment.

Never expose service-role keys to Expo, browser, or mobile clients.
