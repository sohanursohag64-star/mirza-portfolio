// Server-side Supabase client (service-role key).
// Used in server actions and API routes. NEVER expose in frontend code.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) throw new Error("Supabase env vars required");

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
