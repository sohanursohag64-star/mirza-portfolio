// Pure (no Next.js / browser deps) so it can run under plain Node in tests and be imported
// from both server components (auth.ts) and server actions (login/actions.ts) alike.
export interface SupaLike { from: (table: string) => any }

export async function verifyAdminProfile(sb: SupaLike, userId: string): Promise<boolean> {
  try {
    const { data, error } = await sb.from("admin_profiles").select("role").eq("user_id", userId).maybeSingle();
    if (error) return false;
    return data?.role === "admin";
  } catch {
    return false; // fail closed: a DB error must not be treated as "still admin"
  }
}
