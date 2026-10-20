// ---------------------------------------------------------------------------
// SITE CONTENT
// Static arrays typed against lib/types.ts. Only confirmed facts are filled
// in; everything else is an editable placeholder or a clearly marked demo
// record. This file is the swap point for Supabase queries later — every
// component consumes these exact shapes, so the swap needs no component
// changes.
// ---------------------------------------------------------------------------

import type {
  CareerEntry,
  Region,
  TeamMember,
  ExpertiseItem,
  Achievement,
  Activity,
} from "./types";

export const profile = {
  name: "Mirza Asif Iqbal",
  role: "Zonal Manager",
  division: "Specialty Product Division",
  company: "Radiant Pharmaceuticals Ltd.",
  yearsExperience: "7+",
  previousOrganization: "GlaxoSmithKline (GSK)",
  headline: "Leading Teams. Driving Performance. Building Sustainable Growth.",
  intro:
    "Pharmaceutical sales professional with 7 years of experience, including previous experience with GlaxoSmithKline and current leadership responsibility in the Specialty Product Division of Radiant Pharmaceuticals Ltd.",
  portraitPlaceholder: true,
};

export const stats = [
  { icon: "briefcase", value: "7+", label: "Years Experience" },
  { icon: "users", value: "27", label: "Team Members" },
  { icon: "map", value: "22", label: "Territories" },
  { icon: "layers", value: "5", label: "Regions" },
];

export const leadershipFocus = [
  { icon: "target", title: "Strategic Sales Management" },
  { icon: "users", title: "Team Leadership" },
  { icon: "map-pin", title: "Territory Development" },
  { icon: "bar-chart", title: "Performance Management" },
];

export const philosophy = {
  heading: "Leadership Philosophy",
  pillars: [
    {
      icon: "heart-handshake",
      title: "Empower People",
      description:
        "Develop people through coaching, mentoring and continuous support.",
    },
    {
      icon: "trending-up",
      title: "Drive Performance",
      description: "Convert strategy into measurable execution.",
    },
    {
      icon: "sprout",
      title: "Build Sustainable Growth",
      description:
        "Develop people, territories and customer relationships for long-term growth.",
    },
  ],
};

// -------------------- 1. Career Journey --------------------
// 7 years of professional experience total is confirmed; it is NOT assumed
// that all 7 were spent at Radiant. Dates and the GSK designation are
// unconfirmed and left as explicit placeholders.
export const career: CareerEntry[] = [
  {
    id: "career-radiant",
    organization: "Radiant Pharmaceuticals Ltd.",
    designation: "Zonal Manager",
    division: "Specialty Product Division",
    start_date: null,
    end_date: null, // current role
    responsibilities: ["Add from Admin Panel"],
    key_contributions: ["Add from Admin Panel"],
    description: "Add from Admin Panel",
    display_order: 1,
  },
  {
    id: "career-gsk",
    organization: "GlaxoSmithKline (GSK)",
    designation: "Designation — Add from Admin Panel",
    label: "Previous Organization",
    start_date: null,
    end_date: null,
    responsibilities: ["Add from Admin Panel"],
    key_contributions: ["Add from Admin Panel"],
    description: "Add from Admin Panel",
    display_order: 2,
  },
];

// -------------------- 2 & 4. Leadership, Regions & Territories --------------------
// Region count (5) is confirmed; individual region/territory names and their
// per-region breakdown are not, so every row is a placeholder ready for the
// Admin Panel rather than an invented split of the 22 territories / 27 team
// members. Relationships mirror the future schema:
//   regions.id -> territories.region_id -> team_members.territory_id
export const regions: Region[] = Array.from({ length: 5 }, (_, i) => ({
  id: `region-${i + 1}`,
  name: "Region Name — Add from Admin Panel",
  territory_count: null,
  team_member_count: null,
  display_order: i + 1,
}));

export const leadershipScale = {
  heading: "Leadership at Scale",
  intro:
    "Responsibility spanning multiple regions and territories, with a team built on consistent coaching and execution.",
  metrics: [
    { value: "5", label: "Regions" },
    { value: "22", label: "Territories" },
    { value: "27", label: "Team Members" },
  ],
  emptyState: "Team and territory details will be added through the Admin Panel.",
};

// -------------------- 3. Team --------------------
// Structural placeholders only — not real people. is_placeholder flags them
// so the Admin Panel / a future query can distinguish real records from UI
// scaffolding at a glance.
export const teamMembers: TeamMember[] = Array.from({ length: 3 }, (_, i) => ({
  id: `team-placeholder-${i + 1}`,
  name: "Name — Add from Admin Panel",
  designation: "Designation — Add from Admin Panel",
  region_id: null,
  territory_id: null,
  photo_url: null,
  description: "Add from Admin Panel",
  status: "vacant" as const,
  display_order: i + 1,
  is_placeholder: true,
}));

// -------------------- 5. Professional Expertise --------------------
export const expertise: ExpertiseItem[] = [
  { id: "exp-1", icon: "target", title: "Strategic Sales Management", description: "Add from Admin Panel", display_order: 1 },
  { id: "exp-2", icon: "users", title: "Team Leadership", description: "Add from Admin Panel", display_order: 2 },
  { id: "exp-3", icon: "map", title: "Territory Management", description: "Add from Admin Panel", display_order: 3 },
  { id: "exp-4", icon: "bar-chart", title: "Performance Management", description: "Add from Admin Panel", display_order: 4 },
  { id: "exp-5", icon: "graduation-cap", title: "Sales Force Coaching", description: "Add from Admin Panel", display_order: 5 },
  { id: "exp-6", icon: "trending-up", title: "Business Development", description: "Add from Admin Panel", display_order: 6 },
  { id: "exp-7", icon: "globe", title: "Market Development", description: "Add from Admin Panel", display_order: 7 },
  { id: "exp-8", icon: "stethoscope", title: "HCP Engagement", description: "Add from Admin Panel", display_order: 8 },
  { id: "exp-9", icon: "compass", title: "Strategic Planning", description: "Add from Admin Panel", display_order: 9 },
  { id: "exp-10", icon: "check-circle", title: "Execution Management", description: "Add from Admin Panel", display_order: 10 },
];

// -------------------- 6. Achievements & Milestones --------------------
// No real achievements have been provided. One demo record is included,
// clearly flagged is_demo: true, purely to preview the card layout — it is
// rendered with a visible "Demo — layout preview only" tag, never as fact.
export const achievements: Achievement[] = [
  {
    id: "achievement-demo-1",
    title: "Sample Achievement Title",
    year: "20XX",
    category: "Sales",
    description:
      "This is placeholder layout content, not a real achievement. Replace or remove from the Admin Panel.",
    performance_metric: "Sample metric",
    image_url: null,
    document_url: null,
    is_demo: true,
    display_order: 1,
  },
];

// -------------------- 7 & 8. Leadership Activities --------------------
// No activities have been confirmed yet — kept empty on purpose.
export const activities: Activity[] = [];

export const gallery = [
  { id: 1, caption: "[Add caption]" },
  { id: 2, caption: "[Add caption]" },
  { id: 3, caption: "[Add caption]" },
  { id: 4, caption: "[Add caption]" },
  { id: 5, caption: "[Add caption]" },
  { id: 6, caption: "[Add caption]" },
];

export const contact = {
  heading: "Get in Touch",
  email: "[add email address]",
  phone: "[add phone number]",
  location: "[add city / region]",
  linkedin: "[add LinkedIn URL]",
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Leadership", href: "#leadership" },
  { label: "Career", href: "#career" },
  { label: "Team", href: "#team" },
  { label: "Regions", href: "#regions" },
  { label: "Expertise", href: "#expertise" },
  { label: "Achievements", href: "#achievements" },
  { label: "Activities", href: "#activities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];
