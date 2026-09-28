-- SecureFix AI: user profiles with Row Level Security.
-- Run in Supabase Dashboard > SQL Editor (or `supabase db push` with the CLI).
--
-- RLS is the real data-level authorization: even with the public anon key,
-- a user can only read/update their own row.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If an older profiles table already existed, `create table if not exists`
-- skips it, so make sure the columns the app needs are present.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- No insert/delete policies: rows are created by the trigger below and
-- removed by the ON DELETE CASCADE, never directly by clients.

-- Create a profile automatically whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Making someone an admin (run manually; app_metadata cannot be changed by users):
--
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--   where email = 'admin@example.com';
--
-- The user must sign out and back in (or wait for a token refresh) to get
-- the new role in their JWT.
-- ---------------------------------------------------------------------------
