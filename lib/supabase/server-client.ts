// Cookie-aware Supabase client for Server Components, Server Actions and Route Handlers.
// Reads the session from cookies and (where the runtime allows) writes refreshed tokens back.
// Uses the ANON key only — this client is bound to the signed-in user, not a privileged client.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createServerSupabase() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component render, where cookies() is read-only.
          // Harmless here: middleware already refreshes the session on every request.
        }
      },
    },
  });
}
