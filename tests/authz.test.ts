import { test } from "node:test";
import assert from "node:assert/strict";
import { ALLOWED_TABLES, assertAllowedTable } from "../lib/admin/allowed-tables.ts";
import { isSessionError } from "../lib/admin/session.ts";
import { verifyAdminProfile } from "../lib/supabase/admin-check.ts";

test("allowed-tables: permits only the known CMS tables, blocks governance tables", () => {
  for (const t of ALLOWED_TABLES) assert.doesNotThrow(() => assertAllowedTable(t));
  for (const t of ["admin_profiles", "audit_logs", "stored_files", "file_audit_logs", "orphaned_files", "pg_catalog.pg_user"])
    assert.throws(() => assertAllowedTable(t), /not permitted/);
});

test("isSessionError: matches only the two auth error codes, not arbitrary errors", () => {
  assert.equal(isSessionError(new Error("UNAUTHENTICATED")), true);
  assert.equal(isSessionError(new Error("FORBIDDEN")), true);
  assert.equal(isSessionError(new Error("Network error")), false);
  assert.equal(isSessionError("FORBIDDEN"), true);
  assert.equal(isSessionError(null), false);
});

function fakeAdminProfiles(rows: Record<string, { role: string }>) {
  return { from: (table: string) => {
    assert.equal(table, "admin_profiles");
    return { select: () => ({ eq: (_k: string, id: string) => ({
      maybeSingle: async () => rows[id] ? { data: rows[id], error: null } : { data: null, error: null },
    }) }) };
  } };
}
test("verifyAdminProfile: true only for a live admin row; false when missing, wrong role, or query fails", async () => {
  const sb = fakeAdminProfiles({ "u-admin": { role: "admin" }, "u-editor": { role: "editor" } });
  assert.equal(await verifyAdminProfile(sb, "u-admin"), true);
  assert.equal(await verifyAdminProfile(sb, "u-editor"), false);
  assert.equal(await verifyAdminProfile(sb, "u-gone"), false); // revoked: row deleted
  const broken = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => { throw new Error("down"); } }) }) }) };
  assert.equal(await verifyAdminProfile(broken, "u-admin"), false); // fail closed on DB error
});
