// Runs on every request: refreshes the Supabase session cookie and gates /admin/(panel).
// The login page itself is intentionally NOT gated here.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser(); // validates the JWT server-side
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isPanel = pathname.startsWith("/admin") && !isLogin;

  // Both the JWT claim and a live admin_profiles row are required. The claim alone can stay
  // valid for up to an hour after an admin is revoked; this closes that gap on every navigation,
  // not just on the next server action.
  const checkAdmin = async () => {
    if (!data.user || data.user.app_metadata?.role !== "admin") return false;
    const { data: row, error } = await supabase.from("admin_profiles").select("role").eq("user_id", data.user.id).maybeSingle();
    return !error && row?.role === "admin";
  };

  if (isPanel) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      // Had a session but it no longer qualifies as admin (expired, signed out elsewhere, or
      // revoked) — show the "session expired" message instead of a plain login form.
      if (data.user) url.searchParams.set("expired", "1");
      return NextResponse.redirect(url);
    }
  }
  if (isLogin && (await checkAdmin())) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}
