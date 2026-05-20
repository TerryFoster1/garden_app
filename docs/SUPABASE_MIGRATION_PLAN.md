# Supabase Migration Plan

This plan starts public-beta backend work without breaking the local alpha.

## Current Default

Pattypan remains local-first by default:

- `EXPO_PUBLIC_ENABLE_SUPABASE=false`
- Local prototype auth stays active.
- Local persistence stays active.
- Existing alpha workflows keep working.

## Phase 1: Configuration And Schema

- Add Supabase URL and anon key placeholders.
- Add disabled-by-default Supabase client.
- Draft `supabase/schema.sql`.
- Draft `supabase/rls.sql`.
- Document RLS and storage policy.

## Phase 2: Real Supabase Project

1. Create Supabase project.
2. Add `EXPO_PUBLIC_SUPABASE_URL`.
3. Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Keep `EXPO_PUBLIC_ENABLE_SUPABASE=false` until auth wiring is tested.
5. Run schema SQL in Supabase SQL editor or migration tooling.
6. Run RLS SQL.
7. Create private `plant-photos` bucket.

## Supabase Setup Checklist

Keep local alpha active while completing this checklist.

- [ ] Confirm `.env.local` has `EXPO_PUBLIC_SUPABASE_URL`.
- [ ] Confirm `.env.local` has `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Confirm `.env.local` still has `EXPO_PUBLIC_ENABLE_SUPABASE=false`.
- [ ] Open Supabase SQL Editor.
- [ ] Run `supabase/schema.sql`.
- [ ] Run `supabase/rls.sql`.
- [ ] Create private Storage bucket `plant-photos`.
- [ ] Add storage policies for `{user_id}/...` paths.
- [ ] Create two test users.
- [ ] Confirm user A can CRUD their own profile/garden/bed/plant rows.
- [ ] Confirm user B cannot read or mutate user A rows.
- [ ] Confirm authenticated users can read `plant_species_cache`.
- [ ] Confirm client cannot write `subscriptions`.
- [ ] Confirm client cannot write `entitlement_overrides`.
- [ ] Confirm user-owned photo path access works.
- [ ] Only after policy tests pass, test `EXPO_PUBLIC_ENABLE_SUPABASE=true` locally.

## Phase 3: Auth Adapter

- Add Supabase email/password sign-up and sign-in.
- Keep local auth as fallback/dev mode.
- Create profile row after sign-up.
- Store account state in backend tables, not local app state.

Current bridge status:
- `src/services/supabase/authAdapter.ts` defines the future Supabase auth boundary.
- The app still uses local alpha auth until the bridge is intentionally switched over.
- Disabled mode returns safe local-alpha responses and does not interrupt current sign-up/sign-in.

## Phase 4: Repository Adapter

Add a Supabase repository adapter with the same conceptual operations as the local alpha:

- load user garden model
- save profile
- create/update garden
- create/update bed
- create/update plant instance
- move plant
- remove plant
- add plant photo
- add diagnosis
- create/update care task

Do not migrate all UI at once. Switch one workflow at a time behind the Supabase flag.

Current bridge status:
- `src/services/supabase/repositoryAdapter.ts` defines the future sync boundary.
- Local persistence remains the source of truth.
- Supabase plant/photo sync methods intentionally do not run until a real adapter is implemented.

## Phase 5: Photo Storage

- Upload plant and diagnosis photos to private Supabase Storage.
- Store `storage_path` in `plant_photos`.
- Generate signed URLs only when needed.
- Keep latest-photo-as-profile behavior.

## Phase 6: Secure API Proxy

Move OpenAI, PlantNet, and OpenWeather keys out of Expo public env.

Provider calls should go through Supabase Edge Functions or Vercel server routes:

- identify plant
- diagnose plant
- ask Pattypan
- optimize bed
- weather current/forecast

## Phase 7: Stripe

Stripe waits until Supabase auth/profile IDs exist.

Then:
- Create Stripe customer for backend user.
- Create subscription checkout session server-side.
- Add webhook handler.
- Store subscription state.
- Derive entitlements from `subscriptions` plus `entitlement_overrides`.

## Cutover Rule

Do not remove local alpha storage until:

- Supabase auth works.
- Core garden sync works.
- Photo upload works.
- Provider proxy works.
- Stripe webhook state is tested.
- Export/reset path exists for local alpha testers.
