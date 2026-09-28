-- Fix: "Database error saving new user" on signup.
--
-- The project already had an older public.profiles table (id, name, email,
-- created_at), so 0001's `create table if not exists` skipped it and the
-- signup trigger failed writing to the missing `full_name` column.
-- Supabase rolls back the whole signup when that trigger fails.

-- 1. Add the columns the app expects
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 2. Trigger fills both the old and new columns, and never blocks signup:
--    if the profile insert fails, the user is still created and a warning is logged.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, full_name, email)
  select new.id,
         new.raw_user_meta_data ->> 'full_name',
         new.raw_user_meta_data ->> 'full_name',
         new.email
  where not exists (select 1 from public.profiles where id = new.id);
  return new;
exception when others then
  raise warning 'handle_new_user: could not create profile for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Create profiles for users who signed up before the trigger existed
insert into public.profiles (id, name, full_name, email)
select u.id,
       u.raw_user_meta_data ->> 'full_name',
       u.raw_user_meta_data ->> 'full_name',
       u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
