// Run against a REAL deployed Supabase project + running Next.js app, after storage.sql and
// rls.sql have both been applied and an admin has been provisioned (see bottom of rls.sql).
// Covers Tests A-G from the authorization spec. Nothing here runs in this sandbox (no network).
//
//   SITE=https://your-app.example \
//   URL=https://xxx.supabase.co ANON=... \
//   USER_JWT=<a signed-in NON-admin user's access_token> \
//   ADMIN_JWT=<the admin user's access_token> \
//   node tests/verify-live.mjs <existing-object-path-in-bucket> [bucket]
//
// USER_JWT / ADMIN_JWT: sign in via the app or `supabase.auth.signInWithPassword` in a
// one-off script and copy `session.access_token`. Optional — tests that need them are
// skipped (and reported SKIP) when absent, everything else still runs.
const { SITE, URL: U, ANON, USER_JWT, ADMIN_JWT } = process.env;
const [path, bucket = "private-documents"] = process.argv.slice(2);
const results = []; // [label, "PASS"|"FAIL"|"SKIP", detail?]
const record = (label, ok, detail) => results.push([label, ok ? "PASS" : "FAIL", detail]);
const skip = (label, why) => results.push([label, "SKIP", why]);

const storageCall = (jwt, url, init = {}) =>
  fetch(url, { ...init, headers: { apikey: ANON, Authorization: `Bearer ${jwt || ANON}`, ...(init.headers || {}) } });

async function storageDenied(name, jwt) {
  const pub = await fetch(`${U}/storage/v1/object/public/${bucket}/${path}`);
  const direct = await storageCall(jwt, `${U}/storage/v1/object/authenticated/${bucket}/${path}`);
  const sign = await storageCall(jwt, `${U}/storage/v1/object/sign/${bucket}/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 60 }),
  });
  const list = await storageCall(jwt, `${U}/storage/v1/object/list/${bucket}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefix: "" }),
  });
  const listedCount = list.ok ? (await list.json()).length : 0;
  record(`${name}: public URL denied`, !pub.ok);
  record(`${name}: direct authenticated read denied`, !direct.ok);
  record(`${name}: sign request denied`, !sign.ok);
  record(`${name}: bucket listing empty`, listedCount === 0, `${listedCount} objects visible`);
}

async function adminRouteDenied(name, jwt) {
  const res = await fetch(`${SITE}/admin`, { headers: jwt ? { Cookie: `sb-access-token=${jwt}` } : {}, redirect: "manual" });
  // A real browser session uses cookies set by Supabase SSR, not a bearer header, so this is
  // a best-effort check; a manual browser walk-through is the reliable version of Test A/C.
  record(`${name}: /admin does not return 200`, res.status !== 200, `status ${res.status}`);
}

// Test A — anonymous -> /admin redirects to login
if (SITE) await adminRouteDenied("Test A (anonymous /admin)", null);
else skip("Test A (anonymous /admin)", "set SITE to your running app URL");

// Test B — anonymous cannot reach private storage
if (U && ANON && path) await storageDenied("Test B (anonymous storage)", null);
else skip("Test B (anonymous storage)", "set URL, ANON and an object path");

// Test C — authenticated non-admin -> /admin denied
if (SITE && USER_JWT) await adminRouteDenied("Test C (non-admin /admin)", USER_JWT);
else skip("Test C (non-admin /admin)", "set SITE and USER_JWT");

// Test D — authenticated non-admin cannot reach private storage
if (U && ANON && path && USER_JWT) await storageDenied("Test D (non-admin storage)", USER_JWT);
else skip("Test D (non-admin storage)", "set USER_JWT");

// Test E — admin reaches the panel (best confirmed via a real browser login; HTTP-level
// check here only confirms the route doesn't redirect for a valid admin session cookie)
skip("Test E (admin panel access)", "verify manually by logging in through the browser at /admin/login");

// Test F — admin can get a short-lived signed URL for the original
let signedUrl = null;
if (U && ANON && ADMIN_JWT && path) {
  const sign = await storageCall(ADMIN_JWT, `${U}/storage/v1/object/sign/${bucket}/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 60 }),
  });
  record("Test F (admin can sign)", sign.ok, `status ${sign.status}`);
  if (sign.ok) signedUrl = (await sign.json()).signedURL;
} else skip("Test F (admin can sign)", "set ADMIN_JWT");

// Test G — a signed URL stops working after it expires. Sleeps past the 60s TTL; opt in with
// RUN_EXPIRY_TEST=1 since it's slow and not needed on every run.
if (signedUrl && process.env.RUN_EXPIRY_TEST === "1") {
  console.log("Test G: waiting 65s for the signed URL to expire...");
  await new Promise((r) => setTimeout(r, 65_000));
  const res = await fetch(`${U}${signedUrl}`);
  record("Test G (expired signed URL rejected)", !res.ok, `status ${res.status}`);
} else if (signedUrl) {
  skip("Test G (expired signed URL rejected)", "set RUN_EXPIRY_TEST=1 to run (sleeps 65s)");
} else {
  skip("Test G (expired signed URL rejected)", "Test F did not produce a URL");
}

console.log("");
for (const [label, status, detail] of results) console.log(`${status.padEnd(4)} ${label}${detail ? `  (${detail})` : ""}`);
const failed = results.filter(([, s]) => s === "FAIL").length;
console.log(`\n${results.length - failed - results.filter(([, s]) => s === "SKIP").length} passed, ${failed} failed, ${results.filter(([, s]) => s === "SKIP").length} skipped`);
process.exit(failed > 0 ? 1 : 0);
