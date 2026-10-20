// Auth events go through the service-role client so they're recorded even though
// the acting session is about to be (or just was) signed out.
import { supabase } from "@/lib/supabase/server";

export async function logAuthEvent(adminId: string | null, email: string | null | undefined, action: string, note?: string) {
  try {
    await supabase.from("file_audit_logs").insert({
      admin_id: adminId, action, file_type: "auth", status: action.endsWith("FAILED") || action.endsWith("FORBIDDEN") ? "FAILED" : "SUCCESS",
      error_message: note ?? (email ? `email=${email}` : null),
    });
  } catch { /* auditing must never block sign-in/out */ }
}
