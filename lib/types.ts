// Frontend data contracts. Field names mirror the planned Postgres columns
// (snake_case) so a Supabase row maps 1:1 onto these types.
// Future relations: regions.id -> territories.region_id -> team_members.territory_id

export type ID = string;

export interface CareerEntry {
  id: ID;
  organization: string;
  designation: string | null;
  division?: string | null;
  label?: string | null; // e.g. "Previous Organization"
  start_date: string | null; // ISO date
  end_date: string | null; // null on the current role
  responsibilities: string[];
  key_contributions: string[];
  description: string | null;
  display_order: number;
}

export interface Region {
  id: ID;
  name: string;
  territory_count: number | null;
  team_member_count: number | null;
  display_order: number;
}

export interface Territory {
  id: ID;
  region_id: ID; // territories.region_id -> regions.id
  name: string;
  display_order: number;
}

export type TeamStatus = "active" | "on_leave" | "vacant";

export interface TeamMember {
  id: ID;
  name: string;
  designation: string | null;
  region_id: ID | null;
  territory_id: ID | null; // team_members.territory_id -> territories.id
  photo_url: string | null;
  description: string | null;
  status: TeamStatus;
  display_order: number;
  is_placeholder?: boolean; // UI scaffolding only, never a real person
}

export interface ExpertiseItem {
  id: ID;
  icon: string; // key resolved to a lucide icon in the component
  title: string;
  description: string;
  display_order: number;
}

export type AchievementCategory =
  | "Sales"
  | "Leadership"
  | "Team Development"
  | "Market Development"
  | "Professional"
  | "Other";

export interface Achievement {
  id: ID;
  title: string;
  year: string | null;
  category: AchievementCategory;
  description: string | null;
  performance_metric: string | null;
  image_url: string | null;
  document_url: string | null;
  is_demo?: boolean;
  display_order: number;
}

export interface Activity {
  id: ID;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  category: string;
  images?: string[];
  display_order: number;
}
