-- Run in Supabase SQL Editor AFTER schema.sql.
-- 1) PRIVATE buckets (public = false). No public bucket exists for originals.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('private-profile',      'private-profile',      false, 10485760, array['image/jpeg','image/png','image/webp']),
 ('private-gallery',      'private-gallery',      false, 15728640, array['image/jpeg','image/png','image/webp']),
 ('private-documents',    'private-documents',    false, 26214400, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation']),
 ('private-achievements', 'private-achievements', false, 26214400, array['image/jpeg','image/png','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update set public = false;

-- 2) storage.objects has RLS enabled by Supabase. We add NO policies for anon/authenticated,
--    so only the service role (server-side) can read/write. Remove any policy you may have added by hand:
--    select policyname from pg_policies where schemaname='storage' and tablename='objects';

-- 3) Metadata (one row per stored file; paths never leave the server)
create table if not exists stored_files (
  id uuid primary key,
  kind text not null check (kind in ('profile','gallery','documents','achievements')),
  bucket text not null,
  original_path text not null unique,
  public_path text,            -- re-encoded WebP derivative (images only)
  thumbnail_path text,
  original_name text not null, -- sanitized display/download name only, never used as a path
  mime_type text not null,
  file_size bigint not null,
  is_public boolean not null default false,  -- allowlist for the public image route
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists orphaned_files (   -- storage deletes that failed; retry/cleanup queue
  id bigserial primary key, bucket text not null, storage_path text not null, file_id uuid, reason text,
  created_at timestamptz not null default now()
);
create table if not exists file_audit_logs (
  id bigserial primary key, admin_id uuid, action text not null, file_type text, file_id uuid,
  status text not null, error_message text, created_at timestamptz not null default now()
);
-- Link existing content tables to files
alter table gallery      add column if not exists file_id uuid references stored_files(id) on delete set null;
alter table documents    add column if not exists file_id uuid references stored_files(id) on delete set null;
alter table achievements add column if not exists image_file_id uuid references stored_files(id) on delete set null;
alter table achievements add column if not exists document_file_id uuid references stored_files(id) on delete set null;
alter table profiles     add column if not exists photo_file_id uuid references stored_files(id) on delete set null;

-- 4) Lock the new tables down: RLS on, zero policies => anon/authenticated get nothing.
alter table stored_files enable row level security;
alter table orphaned_files enable row level security;
alter table file_audit_logs enable row level security;
revoke all on stored_files, orphaned_files, file_audit_logs from anon, authenticated;

-- 5) Make yourself admin (role lives in app_metadata, which users cannot edit):
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}' where email = 'YOUR_ADMIN_EMAIL';

-- 6) Auth events are recorded in file_audit_logs with file_type='auth'
--    (LOGIN_SUCCESS, LOGIN_FAILED, LOGIN_FORBIDDEN, LOGOUT).

-- Indexes for the file-link columns above and stored_files' own lookup patterns
-- (safe to re-run: IF NOT EXISTS). Add these even if storage.sql was already applied.
CREATE INDEX IF NOT EXISTS idx_gallery_file ON gallery(file_id);
CREATE INDEX IF NOT EXISTS idx_documents_file ON documents(file_id);
CREATE INDEX IF NOT EXISTS idx_achievements_image_file ON achievements(image_file_id);
CREATE INDEX IF NOT EXISTS idx_achievements_document_file ON achievements(document_file_id);
CREATE INDEX IF NOT EXISTS idx_stored_files_kind_public ON stored_files(kind, is_public, created_at DESC);

-- Added for per-person team member photos (separate from the single "profile" photo).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('private-team', 'private-team', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;

alter table team_members add column if not exists photo_file_id uuid references stored_files(id) on delete set null;
CREATE INDEX IF NOT EXISTS idx_team_members_photo_file ON team_members(photo_file_id);
