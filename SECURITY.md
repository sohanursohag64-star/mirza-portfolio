# Security layers — Mirza Asif Iqbal admin panel

## Active layers

**Frontend**
- `/admin/*` route tree uses no client-side-only guard; all gating is server-side (middleware + server actions), so hiding a button never substitutes for an actual check.
- Session-expiry UX: a server action rejecting with `UNAUTHENTICATED`/`FORBIDDEN` redirects the browser to `/admin/login?expired=1`, which shows "Your session has expired. Please sign in again."

**Server (middleware + server actions)**
- `middleware.ts` runs on every `/admin/*` request, revalidates the JWT with Supabase (`getUser()`, not just the cookie), and additionally re-checks a live `admin_profiles` row before allowing the panel — closing the window where a revoked admin's JWT is still technically valid.
- Every server action and every `lib/files/service.ts` method calls `requireAdmin()` first, before any DB or storage read/write. `requireAdmin()` does the same two-step check (JWT claim + DB row) as middleware.
- Generic CRUD actions (`createRecord`/`updateRecord`/`deleteRecord`/`fetchRecords`) are restricted to an explicit table allowlist (`lib/admin/allowed-tables.ts`) — governance tables (`admin_profiles`, `audit_logs`, `stored_files`, `file_audit_logs`, `orphaned_files`) are never reachable through that generic path.
- Signed download URLs (`fileService.getDownloadUrl`) are generated only after `requireAdmin()` succeeds and the file row is looked up server-side by its UUID — the bucket/path come from the database, never from client input. TTL is 60 seconds.

**Database (PostgreSQL / RLS)** — `lib/supabase/rls.sql`
- `admin_profiles(user_id, name, email, role)` is the source of truth for the admin role; `is_admin()` is a `SECURITY DEFINER` function used in every policy below.
- Every content table has RLS enabled: anon/authenticated get `SELECT` only on published rows (`is_active = true`, or always-public for `profiles`/`career`/`contact`); admin gets full CRUD via `is_admin()`. `documents` (legacy, private) and `audit_logs` get no public policy at all.
- `stored_files`, `orphaned_files`, `file_audit_logs` are RLS-enabled with an admin-only `SELECT` policy and no public policy; writes remain service-role-only on purpose (UUID paths and derivative generation must go through `lib/files/service.ts`, not a raw insert).
- This is defense-in-depth: the app's actual write path uses the service-role key, which bypasses RLS entirely. RLS guarantees that even a misused anon/authenticated client can't read unpublished content or touch admin data.

**Storage**
- Four buckets (`private-profile`, `private-gallery`, `private-documents`, `private-achievements`) are private at creation (`public = false`), with size/MIME allowlists set at the bucket level too.
- `storage.objects` policies scope each bucket to `is_admin()` only — anonymous and non-admin authenticated users have no matching policy, i.e. zero access, not even to list.
- Public image display never touches the originals: approved images are re-encoded to WebP (`lib/files/derivatives.ts`, strips EXIF) and served from `/api/public-image/[id]`, which checks `is_public = true` in the DB before returning bytes. Documents have no public derivative and are never served this route.

**Secrets**
- `SUPABASE_SERVICE_ROLE_KEY` is read in exactly one file (`lib/supabase/server.ts`), which is never imported by a `"use client"` component (verified by grep, see below).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally public (that's what the anon key is for); it's meaningless without RLS, which is why RLS is enforced on every table it can reach.

**Transport / browser**
- Security headers (`next.config.mjs`): `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. CSP allows `'unsafe-inline'` for script/style (Next's inline hydration data and Tailwind need it without nonce wiring); a nonce-based CSP is a worthwhile upgrade before a high-stakes public launch.

**Input handling**
- File uploads are validated by real content (magic-byte sniffing), not filename or client-supplied MIME (`lib/files/validate.ts`); extension, declared MIME and detected content must all agree.
- All DB reads/writes go through the Supabase client (parameterized under the hood), never string-built SQL — no SQL injection surface.
- No `dangerouslySetInnerHTML`, `.innerHTML`, or `eval` anywhere in the codebase (verified by grep, see below) — React's default escaping handles admin-entered text safely.
- Filenames are sanitized and storage paths are UUID-based, never derived from user input.

**Audit logging**
- `file_audit_logs` records `FILE_UPLOAD`, `FILE_DOWNLOAD`, `FILE_DELETE`, `FILE_REPLACE`, and `auth`-typed `LOGIN_SUCCESS`/`LOGIN_FAILED`/`LOGIN_FORBIDDEN`/`LOGOUT` events, each with admin id and timestamp, denials included.
- `audit_logs` records `CREATE`/`UPDATE`/`DELETE` on content tables with before/after values.
- Both tables are RLS-locked (admin-only `SELECT`, no public policy whatsoever).

**Delete protection**
- `FileLibrary`'s delete button requires a native `confirm()` before calling the delete action; ResourceManager's existing `ConfirmDialog` covers content-table deletes.

## What I ran here (no network in this sandbox)

- 18 automated tests (`npm run test:files`), all passing: file-service access control across anonymous/non-admin/admin; input validation against spoofed file types; the table allowlist; session-error detection; and `verifyAdminProfile` (missing row, wrong role, DB failure all correctly deny).
- A grep sweep for `service_role`/`SUPABASE_SERVICE_ROLE_KEY` (one server-only file, confirmed not imported by any `"use client"` file), hardcoded passwords (none), `getPublicUrl`/public storage URLs (none), and XSS sinks (none).

## What still needs a real environment (Tests A–G)

`tests/verify-live.mjs` is built to run Tests A–G from the spec against a deployed project — but I had no network access or live Supabase project in this session, so it has **not actually been run**. Treat it as a script to run, not a result. After you deploy `schema.sql` → `storage.sql` → `rls.sql`, provision an admin, and start the app:

```
SITE=https://your-app URL=https://xxx.supabase.co ANON=... USER_JWT=... ADMIN_JWT=... \
  node tests/verify-live.mjs <existing-object-path> <bucket>
```

Test E (admin panel access) and the cookie-based parts of A/C are best confirmed by actually logging in through a browser — the script's HTTP-level checks there are a rough approximation, not a substitute. Test G sleeps 65 seconds and only runs with `RUN_EXPIRY_TEST=1`.
