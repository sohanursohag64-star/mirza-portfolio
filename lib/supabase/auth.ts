// Server-only helpers for reading the current session and enforcing the admin role.
//
// Two checks, not one: assertAdmin() reads the JWT's app_metadata (fast, no DB round trip),
// then verifyAdminProfile() confirms a live admin_profiles row still exists. The JWT can stay
// valid for up to an hour after an admin is revoked; the DB check closes that window on every
// request.
import { createServerSupabase } from "./server-client.ts";
import { assertAdmin, AuthError, type AuthUser } from "../files/guard.ts";
import { verifyAdminProfile } from "./admin-check.ts";

export { verifyAdminProfile };

// For UI: who's signed in, without throwing. Returns null when signed out.
export async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  const sb = createServerSupabase();
  const { data } = await sb.auth.getUser(); // re-validates the JWT against Supabase, not just the cookie
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}

// For actions/routes: throws AuthError("UNAUTHENTICATED" | "FORBIDDEN") when not a verified admin.
export async function requireAdmin() {
  const sb = createServerSupabase();
  const { data } = await sb.auth.getUser();
  const basic = assertAdmin(data.user as AuthUser | null); // fast path: JWT claim
  const stillAdmin = await verifyAdminProfile(sb, basic.id); // source of truth: DB row
  if (!stillAdmin) throw new AuthError("FORBIDDEN");
  return basic;
}
