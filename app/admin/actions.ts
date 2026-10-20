"use server";
// Server actions for admin CRUD operations.
// These use the service-role key and run only on the server.
import { supabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { Row } from "@/lib/admin/types";
import { assertAllowedTable } from "@/lib/admin/allowed-tables";

// Never surface raw Postgres error text to the client (column/constraint names, internal
// structure). Log the full detail server-side and return a short, safe message instead.
function friendlyDbError(action: string, error: { code?: string; message: string }): Error {
  console.error(`[db] ${action} failed:`, error);
  const byCode: Record<string, string> = {
    "23505": "That value is already in use. Please use a different one.",
    "23503": "This record is linked to other data and can't be changed that way.",
    "23502": "A required field is missing.",
    "22P02": "One of the values entered isn't in a valid format.",
  };
  return new Error(byCode[error.code ?? ""] ?? `Could not ${action}. Please try again.`);
}

// Generic CRUD helper that logs to audit table
async function logAudit(table: string, op: "CREATE" | "UPDATE" | "DELETE", recordId: string, oldVals?: any, newVals?: any) {
  await supabase.from("audit_logs").insert({
    table_name: table,
    operation: op,
    record_id: recordId,
    old_values: oldVals,
    new_values: newVals,
    admin_email: (await requireAdmin()).email ?? null,
  });
}

// Generic CREATE
export async function createRecord(table: string, values: Record<string, any>) {
  await requireAdmin();
  assertAllowedTable(table);
  const { data, error } = await supabase.from(table).insert([values]).select();
  if (error) throw friendlyDbError(`create this ${table.slice(0, -1) || "record"}`, error);
  const record = data?.[0];
  if (record) await logAudit(table, "CREATE", record.id, undefined, values);
  return record;
}

// Generic UPDATE
export async function updateRecord(table: string, id: string, values: Record<string, any>) {
  await requireAdmin();
  assertAllowedTable(table);
  const { data: old } = await supabase.from(table).select("*").eq("id", id).single();
  const { data, error } = await supabase.from(table)
    .update({ ...values, updated_at: new Date().toISOString() }).eq("id", id).select();
  if (error) throw friendlyDbError(`update this ${table.slice(0, -1) || "record"}`, error);
  if (data?.[0]) await logAudit(table, "UPDATE", id, old, values);
  return data?.[0];
}

// Generic DELETE
export async function deleteRecord(table: string, id: string) {
  await requireAdmin();
  assertAllowedTable(table);
  const { data: old } = await supabase.from(table).select("*").eq("id", id).single();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw friendlyDbError(`delete this ${table.slice(0, -1) || "record"}`, error);
  if (old) await logAudit(table, "DELETE", id, old, undefined);
}

// Fetch all records from a table
export async function fetchRecords(table: string, filters?: Record<string, any>) {
  await requireAdmin();
  assertAllowedTable(table);
  let q = supabase.from(table).select("*");
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) q = q.eq(k, v); });
  const { data, error } = await q;
  if (error) throw friendlyDbError("load this content", error);
  return data ?? [];
}

// Special: profile update (single-row)
export async function updateProfile(values: Record<string, any>) {
  await requireAdmin();
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw friendlyDbError("load the profile", error);
  if (!data?.[0]) {
    return createRecord("profiles", values);
  }
  return updateRecord("profiles", data[0].id, values);
}

// Special: contact update (single-row)
export async function updateContact(values: Record<string, any>) {
  await requireAdmin();
  const { data, error } = await supabase.from("contact").select("*");
  if (error) throw friendlyDbError("load the contact details", error);
  if (!data?.[0]) {
    return createRecord("contact", values);
  }
  return updateRecord("contact", data[0].id, values);
}
