-- Pattypan public-beta RLS draft.
-- Run only after reviewing against the live Supabase project.

alter table public.profiles enable row level security;
alter table public.gardens enable row level security;
alter table public.garden_beds enable row level security;
alter table public.plant_species_cache enable row level security;
alter table public.plant_instances enable row level security;
alter table public.plant_photos enable row level security;
alter table public.diagnoses enable row level security;
alter table public.care_tasks enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlement_overrides enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "gardens_owner_all"
  on public.gardens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "garden_beds_owner_all"
  on public.garden_beds for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plant_instances_owner_all"
  on public.plant_instances for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plant_photos_owner_all"
  on public.plant_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "diagnoses_owner_all"
  on public.diagnoses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "care_tasks_owner_all"
  on public.care_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weather_snapshots_owner_all"
  on public.weather_snapshots for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plant_species_cache_read_authenticated"
  on public.plant_species_cache for select
  using (auth.role() = 'authenticated');

create policy "subscriptions_owner_read"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- No client write policy for subscriptions. Stripe webhooks should update with service role.

-- No client policies for entitlement_overrides in the first beta pass.
-- Admin/service-role functions should manage owner/admin/lifetime/comped access.

-- Storage bucket plan:
-- 1. Create private bucket named plant-photos.
-- 2. Store objects at {user_id}/{plant_instance_id}/{photo_id}.jpg.
-- 3. Add storage.objects policies that compare auth.uid() to the first path segment.
-- Example storage policy shape, review before use:
--
-- create policy "plant_photos_storage_read_own"
--   on storage.objects for select
--   using (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "plant_photos_storage_write_own"
--   on storage.objects for insert
--   with check (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "plant_photos_storage_delete_own"
--   on storage.objects for delete
--   using (bucket_id = 'plant-photos' and auth.uid()::text = (storage.foldername(name))[1]);
