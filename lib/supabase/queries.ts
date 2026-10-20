// Read-only query helpers for public pages (can use anon key).
import { createClient } from "./client";

export async function getProfile() {
  const client = createClient();
  const { data, error } = await client.from("profiles").select("*");
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getStatistics() {
  const client = createClient();
  const { data, error } = await client.from("statistics")
    .select("*").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCareer() {
  const client = createClient();
  const { data, error } = await client.from("career")
    .select("*").order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getExpertise() {
  const client = createClient();
  const { data, error } = await client.from("expertise")
    .select("*").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getRegions() {
  const client = createClient();
  const { data, error } = await client.from("regions")
    .select("*").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTerritories(regionId?: string) {
  const client = createClient();
  let q = client.from("territories").select("*").eq("is_active", true);
  if (regionId) q = q.eq("region_id", regionId);
  const { data, error } = await q.order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTeamMembers() {
  const client = createClient();
  const { data, error } = await client.from("team_members")
    .select("*,regions(name),territories(name)").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAchievements() {
  const client = createClient();
  const { data, error } = await client.from("achievements")
    .select("*").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getActivities() {
  const client = createClient();
  const { data, error } = await client.from("activities")
    .select("*").eq("is_active", true).order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGallery() {
  // Reads the public_files view (approved, derivative-having files only) rather than the
  // legacy `gallery` metadata table — see lib/supabase/rls.sql for why.
  const client = createClient();
  const { data, error } = await client.from("public_files").select("*").eq("kind", "gallery").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getContact() {
  const client = createClient();
  const { data, error } = await client.from("contact").select("*");
  if (error) throw error;
  return data?.[0] ?? null;
}
