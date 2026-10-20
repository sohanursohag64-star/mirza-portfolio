"use server";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server-client";
import { verifyAdminProfile } from "@/lib/supabase/admin-check";
import { logAuthEvent } from "@/lib/files/audit";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function signIn(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !EMAIL_RE.test(email) || !password) {
    return { error: "Enter a valid email and password." };
  }

  const sb = createServerSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await logAuthEvent(null, email, "LOGIN_FAILED", error?.message);
    return { error: "Invalid email or password." };
  }
  // Two checks: the JWT claim (fast) and a live admin_profiles row (source of truth — a
  // revoked admin whose JWT hasn't expired yet still gets rejected here).
  const claimOk = data.user.app_metadata?.role === "admin";
  const dbOk = claimOk && (await verifyAdminProfile(sb, data.user.id));
  if (!claimOk || !dbOk) {
    await logAuthEvent(data.user.id, email, "LOGIN_FORBIDDEN");
    await sb.auth.signOut(); // don't leave a session for a non-admin account
    return { error: "This account is not authorized for admin access." };
  }

  await logAuthEvent(data.user.id, email, "LOGIN_SUCCESS");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const sb = createServerSupabase();
  const { data } = await sb.auth.getUser();
  await sb.auth.signOut();
  if (data.user) await logAuthEvent(data.user.id, data.user.email, "LOGOUT");
  redirect("/admin/login");
}
