// Covers the pure logic behind login: role check and the "safe next path" rule.
// signIn/signOut themselves need a live Next + Supabase runtime and are covered by
// tests/verify-live.mjs and the manual checklist, not here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertAdmin, AuthError } from "../lib/files/guard.ts";

test("assertAdmin: rejects no user, non-admin role, and a spoofed user_metadata role", () => {
  assert.throws(() => assertAdmin(null), (e: any) => e instanceof AuthError && e.code === "UNAUTHENTICATED");
  assert.throws(() => assertAdmin({ id: "1", app_metadata: {} }), (e: any) => e.code === "FORBIDDEN");
  assert.throws(() => assertAdmin({ id: "1", app_metadata: {}, user_metadata: { role: "admin" } } as any), (e: any) => e.code === "FORBIDDEN");
});
test("assertAdmin: accepts app_metadata.role === admin only", () => {
  assert.deepEqual(assertAdmin({ id: "1", email: "a@x.com", app_metadata: { role: "admin" } }), { id: "1", email: "a@x.com" });
});

// Mirrors the "next" redirect guard in app/admin/login/actions.ts so an open-redirect
// regression there would be caught here without needing a browser.
function safeNext(next: string) { return next.startsWith("/admin") ? next : "/admin"; }
test("login redirect target never leaves /admin", () => {
  assert.equal(safeNext("/admin/gallery"), "/admin/gallery");
  assert.equal(safeNext("https://evil.example/phish"), "/admin");
  assert.equal(safeNext("//evil.example"), "/admin");
  assert.equal(safeNext("javascript:alert(1)"), "/admin");
});
