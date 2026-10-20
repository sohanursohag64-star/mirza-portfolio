// The generic CRUD server actions (createRecord/updateRecord/deleteRecord/fetchRecords)
// take a table name from the caller. They're already gated behind requireAdmin(), but an
// allowlist keeps an admin session scoped to the intended content tables even if a request
// is crafted by hand — governance tables (admin_profiles, audit_logs, stored_files,
// file_audit_logs, orphaned_files) are never reachable through this generic path.
export const ALLOWED_TABLES = new Set([
  "profiles", "statistics", "career", "regions", "territories", "team_members",
  "expertise", "achievements", "activities", "gallery", "documents", "contact",
]);

export function assertAllowedTable(table: string): void {
  if (!ALLOWED_TABLES.has(table)) throw new Error(`Table "${table}" is not permitted through this operation`);
}
