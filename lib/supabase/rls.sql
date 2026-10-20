-- Row Level Security + admin role table.
-- Run AFTER schema.sql and storage.sql.
--
-- Model: the service-role key (used by every server action / the file service) bypasses
-- RLS entirely, so RLS here is defense-in-depth, not the only gate — server-side role
-- checks (requireAdmin) remain the primary gate for every write. RLS guarantees that even
-- if a bug ever exposed the anon/authenticated Supabase client to raw queries, a non-admin
-- could still only read published content, and an admin only acts on their own verified role.

-- 1) ADMIN ROLE TABLE ---------------------------------------------------------
create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);
alter table admin_profiles enable row level security;
revoke all on admin_profiles from anon;
-- A signed-in user may see their own row (lets the app re-verify role with the user's own
-- session, not only the service role). No insert/update/delete policy exists for anyone:
-- provisioning an admin is a manual, service-role-only SQL step (see bottom of this file).
create policy admin_profiles_self_select on admin_profiles for select to authenticated
  using (user_id = auth.uid());

-- is_admin(): SECURITY DEFINER so it can read admin_profiles regardless of the caller's own
-- RLS visibility; fixed search_path avoids search-path hijacking in a SECURITY DEFINER function.
create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admin_profiles where user_id = auth.uid() and role = 'admin');
$$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

-- 2) CONTENT TABLES -------------------------------------------------------------
-- Public (anon + authenticated) may SELECT only published rows; admin gets full CRUD.
-- Writes in the app always go through the service role, so the admin policies below are
-- a safety net, not the primary write path.
do $$
declare
  t text;
  published_tables text[] := array['statistics','regions','territories','team_members','expertise','achievements','activities','gallery'];
  always_public_tables text[] := array['profiles','career','contact']; -- no is_active column; every row is public content
  private_tables text[] := array['documents','audit_logs']; -- admin-only, no public policy at all
begin
  foreach t in array published_tables || always_public_tables || private_tables loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_admin_all', t);
    execute format('create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())', t || '_admin_all', t);
  end loop;
  foreach t in array published_tables loop
    execute format('drop policy if exists %I on %I', t || '_public_select', t);
    execute format('create policy %I on %I for select to anon, authenticated using (is_active = true)', t || '_public_select', t);
  end loop;
  foreach t in array always_public_tables loop
    execute format('drop policy if exists %I on %I', t || '_public_select', t);
    execute format('create policy %I on %I for select to anon, authenticated using (true)', t || '_public_select', t);
  end loop;
  -- private_tables intentionally get no public_select policy: RLS enabled + zero select
  -- policy for anon/authenticated means every non-admin read returns zero rows.
end $$;

-- 3) FILE METADATA TABLES (from storage.sql) -------------------------------------
-- Already RLS-enabled with zero policies (locked to the service role only). Add admin-only
-- SELECT so a signed-in admin could read them directly if ever needed; writes stay
-- service-role-only on purpose (uuid paths, derivative generation, orphan bookkeeping all
-- happen in lib/files/service.ts and must not be bypassable via a direct client insert).
do $$
declare t text;
begin
  foreach t in array array['stored_files','orphaned_files','file_audit_logs'] loop
    execute format('drop policy if exists %I on %I', t || '_admin_select', t);
    execute format('create policy %I on %I for select to authenticated using (is_admin())', t || '_admin_select', t);
  end loop;
end $$;

-- 4) STORAGE OBJECT POLICIES -------------------------------------------------
-- storage.objects has RLS enabled by Supabase by default. These policies scope access to
-- our four private buckets by name and require is_admin(); anon and non-admin authenticated
-- users get no matching policy, i.e. no access at all (not even via a stolen anon key).
do $$
declare b text;
begin
  foreach b in array array['private-profile','private-gallery','private-documents','private-achievements'] loop
    execute format('drop policy if exists %I on storage.objects', b || '_admin_rw');
    execute format(
      'create policy %I on storage.objects for all to authenticated using (bucket_id = %L and is_admin()) with check (bucket_id = %L and is_admin())',
      b || '_admin_rw', b, b
    );
  end loop;
end $$;

-- 5) PROVISION YOUR FIRST ADMIN -------------------------------------------------
-- Run this after creating the user in Supabase Auth (Dashboard > Authentication > Users),
-- or after they sign up. Sets BOTH the JWT claim (fast path, used by requireAdmin without
-- a DB round trip) and the admin_profiles row (source of truth, checked on every request —
-- deleting this row revokes access immediately, without waiting for the JWT to expire).
--
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--   where email = 'YOUR_ADMIN_EMAIL';
-- insert into admin_profiles (user_id, name, email)
--   select id, 'Admin Name', email from auth.users where email = 'YOUR_ADMIN_EMAIL';
--
-- To revoke: delete from admin_profiles where email = 'that@email'; and clear the app_metadata role.

-- 6) PUBLIC FILE LISTING VIEW -----------------------------------------------
-- stored_files itself stays admin-only (original_path would leak internal storage layout).
-- This view exposes only what the public site needs to list approved images: no path, no
-- bucket, no size. A plain view runs with its owner's privileges, not the caller's RLS, which
-- is exactly what lets us hand anon/authenticated a narrow slice of an otherwise-locked table.
create or replace view public_files as
  select id, kind, original_name, mime_type, created_at
  from stored_files
  where is_public = true and public_path is not null; -- only kinds with a derivative (documents never qualify)
revoke all on public_files from public;
grant select on public_files to anon, authenticated;

-- 7) private-team BUCKET POLICY (added alongside team member photo uploads) -------
drop policy if exists "private-team_admin_rw" on storage.objects;
create policy "private-team_admin_rw" on storage.objects for all to authenticated
  using (bucket_id = 'private-team' and is_admin()) with check (bucket_id = 'private-team' and is_admin());
