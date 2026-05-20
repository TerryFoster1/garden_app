# Public Beta Backend Plan

Pattypan alpha currently works with local prototype auth, local persistence, and Expo public environment variables. That is useful for personal testing, but it is not safe enough for public beta, Stripe billing, paid AI/provider usage, or cloud sync.

## Recommendation

Use Supabase for the first public-beta backend.

Why Supabase fits Pattypan now:
- Expo-friendly email/password auth and session handling.
- Postgres data model maps cleanly to gardens, beds, plants, tasks, photos, diagnosis history, subscriptions, and entitlements.
- Row Level Security can enforce per-user garden access at the database layer.
- Storage can hold plant photos, diagnosis photos, and growth timelines.
- Edge Functions can proxy OpenAI, PlantNet, OpenWeather, and Stripe webhook logic without exposing server secrets to the app bundle.
- It keeps the backend small while still leaving room to move heavier APIs to Vercel functions later.

## Options Evaluated

### Supabase

Best fit for public beta. It combines auth, Postgres, file storage, row-level security, and serverless functions. The main care point is writing RLS policies carefully before public users are invited.

### Firebase

Strong mobile SDKs and realtime sync, but Pattypan's relational domain fits Postgres better: gardens contain beds, beds contain plant instances, tasks and diagnoses link to plants, and subscriptions link to users. Firestore can do this, but the rules and query model would be less natural.

### Neon Postgres + Custom Vercel API

Good long-term option if the app becomes a more custom platform. It would require building auth, storage, API routes, session refresh, and row-level access checks ourselves. That is more moving parts than Pattypan needs for a first public beta.

### Clerk/Auth.js + Database

Strong for web-first apps, but Pattypan is mobile-first and needs photo storage, offline-ish sync, and a simple Expo path. Clerk plus Neon is viable later, but Supabase offers a more complete first backend in one system.

## Target Backend Domains

- Auth users: email/password first, OAuth later.
- User profiles: display name, location, admin flags, preferences.
- Gardens: indoor/outdoor gardens and ownership.
- Garden beds/containers: dimensions, type, soil, sun/shade, placement metadata.
- Plant species: generic plant knowledge and searchable index.
- Plant instances: user-owned plants in a garden/bed/container.
- Plant photos: uploaded profile, growth, diagnosis, pest, and weed photos.
- Diagnosis history: linked photo, symptoms, provider candidates, AI explanation, recommendations.
- Care tasks: scheduled, done, skipped, snoozed, generated from rules/weather/diagnosis.
- Weather cache: current/forecast snapshots per user location to reduce provider calls.
- Entitlements: free, trial, premium, admin, lifetime, comped.
- Stripe records: customer id, subscription id, status, price id, current period, cancel state.
- Secure API proxy usage: OpenAI, PlantNet, OpenWeather request metering and abuse controls.

## Data Ownership Principle

Every user-owned row must include `user_id`, either directly or through a parent relationship with an RLS policy. Public beta must not rely on hidden UI alone. Access checks belong in database policies and server routes.

## Proposed Supabase Tables

- `profiles`
- `gardens`
- `garden_zones`
- `garden_beds`
- `plant_species`
- `plant_instances`
- `plant_photos`
- `plant_identifications`
- `plant_health_scans`
- `diagnoses`
- `care_tasks`
- `weather_snapshots`
- `weather_alerts`
- `notification_preferences`
- `subscriptions`
- `entitlement_overrides`
- `api_usage_events`

## Migration Strategy

1. Keep the current local alpha intact.
2. Add Supabase client setup behind environment variables.
3. Add real sign-up/sign-in using Supabase Auth.
4. Mirror the local domain model into Supabase tables.
5. Add cloud save/load for profile, gardens, beds, plants, tasks, and photos.
6. Move PlantNet/OpenAI/OpenWeather calls to secure server-side functions.
7. Add Stripe customer/subscription tables and webhooks.
8. Enable feature gates only after subscription sync is proven.

## Public Beta Readiness Gates

- Server-side auth complete.
- RLS policies tested.
- API keys removed from Expo public client env.
- Plant photos stored in private/user-owned storage.
- Stripe webhook idempotency implemented.
- Entitlements derived from backend subscription state.
- Admin/lifetime/comped overrides available to owner accounts.
- Local offline queue can sync or clearly show pending changes.

