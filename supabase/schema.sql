-- Pattypan public-beta schema draft.
-- Apply in Supabase SQL editor before rls.sql.
-- This does not enable the app's Supabase runtime by itself.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  location_label text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gardens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('indoor', 'outdoor', 'raised-bed', 'containers', 'balcony', 'greenhouse')),
  location_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.garden_beds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  name text not null,
  type text not null check (type in ('raised-bed', 'in-ground-bed', 'container', 'pot', 'greenhouse-bed')),
  length_feet numeric(8, 2) not null,
  width_feet numeric(8, 2) not null,
  depth_inches numeric(8, 2),
  soil_type text,
  sun_exposure text check (sun_exposure is null or sun_exposure in ('full-sun', 'part-sun', 'part-shade', 'shade')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_species_cache (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  category text,
  care jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  bed_id uuid references public.garden_beds(id) on delete set null,
  species_id uuid references public.plant_species_cache(id) on delete set null,
  display_name text not null,
  location_type text not null,
  stage text,
  planted_on date,
  current_profile_photo_id uuid,
  position_x_percent numeric(5, 2),
  position_y_percent numeric(5, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_instance_id uuid references public.plant_instances(id) on delete cascade,
  storage_path text not null,
  purpose text not null check (purpose in ('identify', 'diagnose', 'growth-log', 'pest', 'weed')),
  note text,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'plant_instances_current_profile_photo_id_fkey'
  ) then
    alter table public.plant_instances
      add constraint plant_instances_current_profile_photo_id_fkey
      foreign key (current_profile_photo_id) references public.plant_photos(id) on delete set null;
  end if;
end $$;

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_instance_id uuid references public.plant_instances(id) on delete set null,
  photo_id uuid references public.plant_photos(id) on delete set null,
  symptoms text[] not null default '{}',
  summary text not null,
  confidence text,
  provider text,
  created_at timestamptz not null default now()
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_instance_id uuid references public.plant_instances(id) on delete cascade,
  garden_bed_id uuid references public.garden_beds(id) on delete cascade,
  type text not null,
  title text not null,
  due_at timestamptz not null,
  priority text not null default 'normal',
  status text not null default 'scheduled',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_label text not null,
  captured_at timestamptz not null default now(),
  payload jsonb not null
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'free',
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlement_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_state text not null check (account_state in ('admin', 'lifetime', 'comped')),
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists gardens_user_id_idx on public.gardens(user_id);
create index if not exists garden_beds_user_id_idx on public.garden_beds(user_id);
create index if not exists plant_instances_user_id_idx on public.plant_instances(user_id);
create index if not exists plant_photos_user_id_idx on public.plant_photos(user_id);
create index if not exists diagnoses_user_id_idx on public.diagnoses(user_id);
create index if not exists care_tasks_user_id_due_at_idx on public.care_tasks(user_id, due_at);
create index if not exists weather_snapshots_user_id_captured_at_idx on public.weather_snapshots(user_id, captured_at desc);
