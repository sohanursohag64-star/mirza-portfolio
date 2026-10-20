// Registry of admin resources. `rows` hold ONLY confirmed data (from
// lib/data.ts); everything else starts empty so empty states are honest.
// Later: replace `rows` with Supabase queries against `table`.
import { stats, career, expertise } from "@/lib/data";
import type { ResourceConfig } from "./types";

export const ICON_OPTIONS = [
  "briefcase", "users", "map", "layers", "target", "bar-chart", "graduation-cap",
  "trending-up", "globe", "stethoscope", "compass", "check-circle", "award",
];
const ACTIVE = ["Active", "Inactive"];
const PUBLISH = ["Published", "Draft"];

export const resources: Record<string, ResourceConfig> = {
  statistics: {
    key: "statistics", table: "statistics", title: "Statistics", singular: "statistic",
    description: "Headline numbers shown on the public homepage.",
    addLabel: "Add Statistic", emptyTitle: "No statistics added yet.",
    emptyMessage: "Add the key numbers you want visitors to see first.",
    columns: [
      { key: "title", label: "Title" }, { key: "value", label: "Value" },
      { key: "icon", label: "Icon" }, { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Team Members" },
      { name: "value", label: "Value", type: "text", required: true, placeholder: "e.g. 27" },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS, required: true },
      { name: "display_order", label: "Display Order", type: "number", placeholder: "1" },
      { name: "status", label: "Status", type: "select", options: ACTIVE, required: true },
    ],
    searchKeys: ["title", "value"], actions: ["edit", "delete"],
    rows: stats.map((s, i) => ({ id: `stat-${i + 1}`, title: s.label, value: s.value, icon: s.icon, display_order: i + 1, status: "Active" })),
  },
  career: {
    key: "career", table: "career", title: "Career", singular: "career entry",
    description: "Career timeline entries. Dates and designations are added here — never guessed.",
    addLabel: "Add Career", emptyTitle: "No career entries yet.",
    emptyMessage: "Add an organization to start the career timeline.",
    columns: [
      { key: "organization", label: "Organization" }, { key: "designation", label: "Designation" },
      { key: "period", label: "Period", kind: "period", sortable: false },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text", placeholder: "Add designation" },
      { name: "division", label: "Division", type: "text" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date", help: "Leave empty for the current role." },
      { name: "status", label: "Status", type: "select", options: ["Current", "Previous"], required: true },
      { name: "responsibilities", label: "Responsibilities", type: "list", wide: true, help: "One item per line." },
      { name: "key_contributions", label: "Key Contributions", type: "list", wide: true, help: "One item per line." },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "display_order", label: "Display Order", type: "number" },
    ],
    searchKeys: ["organization", "designation"], actions: ["edit", "delete"],
    rows: career.map((c, i) => ({
      id: c.id, organization: c.organization,
      designation: c.designation && !c.designation.includes("Add from") ? c.designation : "",
      division: c.division ?? "", start_date: "", end_date: "",
      status: c.label === "Previous Organization" ? "Previous" : "Current",
      responsibilities: [], key_contributions: [], description: "", display_order: i + 1,
    })),
  },
  team: {
    key: "team", table: "team_members", title: "Team", singular: "team member",
    description: "People in the leadership team, linked to a region and territory.",
    addLabel: "Add Team Member", emptyTitle: "No team members added yet.",
    emptyMessage: "Add your first team member to build the team section.",
    columns: [
      { key: "photo_file_id", label: "Photo", kind: "linked-image", sortable: false }, { key: "name", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "region_id", label: "Region", kind: "lookup", lookup: "regions" },
      { key: "territory_id", label: "Territory", kind: "lookup", lookup: "territories" },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text" },
      { name: "region_id", label: "Region", type: "select", optionsFrom: "regions" },
      { name: "territory_id", label: "Territory", type: "select", optionsFrom: "territories" },
      { name: "description", label: "Short Bio", type: "textarea", wide: true },
      { name: "photo_file_id", label: "Profile Photo", type: "linked-image", wide: true, fileKind: "team" },
      { name: "status", label: "Status", type: "select", options: ["Active", "On Leave", "Position Open"], required: true },
    ],
    filters: [
      { key: "region_id", label: "Region", optionsFrom: "regions" },
      { key: "territory_id", label: "Territory", optionsFrom: "territories" },
      { key: "status", label: "Status", options: ["Active", "On Leave", "Position Open"] },
    ],
    searchKeys: ["name", "designation"], actions: ["edit", "delete"], rows: [],
  },
  regions: {
    key: "regions", table: "regions", title: "Regions", singular: "region",
    description: "Sales regions. Names are added here — none are assumed.",
    addLabel: "Add Region", emptyTitle: "No regions added yet.",
    emptyMessage: "Add regions first, then create territories under them.",
    columns: [
      { key: "name", label: "Region Name" },
      { key: "t", label: "Territories", kind: "count", countBy: { resource: "territories", field: "region_id" } },
      { key: "m", label: "Team Members", kind: "count", countBy: { resource: "team", field: "region_id" } },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Region Name", type: "text", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: ACTIVE, required: true },
    ],
    searchKeys: ["name"], actions: ["edit", "delete"], rows: [],
  },
  territories: {
    key: "territories", table: "territories", title: "Territories", singular: "territory",
    description: "Territories, each belonging to one region.",
    addLabel: "Add Territory", emptyTitle: "No territories added yet.",
    emptyMessage: "Add a region first, then assign territories to it.",
    columns: [
      { key: "name", label: "Territory Name" },
      { key: "region_id", label: "Region", kind: "lookup", lookup: "regions" },
      { key: "a", label: "Assigned Team Members", kind: "count", countBy: { resource: "team", field: "territory_id" } },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "name", label: "Territory Name", type: "text", required: true },
      { name: "region_id", label: "Region", type: "select", optionsFrom: "regions", required: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: ACTIVE, required: true },
    ],
    filters: [{ key: "region_id", label: "Region", optionsFrom: "regions" }],
    searchKeys: ["name"], actions: ["edit", "delete"], rows: [],
  },
  expertise: {
    key: "expertise", table: "expertise", title: "Expertise", singular: "expertise item",
    description: "Skills and competencies shown on the public site.",
    addLabel: "Add Expertise", emptyTitle: "No expertise items yet.",
    emptyMessage: "Add the competencies you want to highlight.",
    columns: [
      { key: "title", label: "Title" }, { key: "description", label: "Description" },
      { key: "icon", label: "Icon" }, { key: "display_order", label: "Order" },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS, required: true },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: ACTIVE, required: true },
    ],
    searchKeys: ["title", "description"], actions: ["edit", "delete"],
    rows: expertise.map((e) => ({
      id: e.id, title: e.title, icon: e.icon, display_order: e.display_order, status: "Active",
      description: e.description.includes("Add from") ? "" : e.description,
    })),
  },
  achievements: {
    key: "achievements", table: "achievements", title: "Achievements", singular: "achievement",
    description: "Achievements and milestones. Only add confirmed, verifiable entries.",
    addLabel: "Add Achievement", emptyTitle: "No achievements available.",
    emptyMessage: "No achievements have been added yet.",
    columns: [
      { key: "title", label: "Title" }, { key: "year", label: "Year" },
      { key: "category", label: "Category" }, { key: "performance_metric", label: "Metric" },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "year", label: "Year", type: "text", placeholder: "e.g. 2025" },
      { name: "category", label: "Category", type: "select", required: true,
        options: ["Sales", "Leadership", "Team Development", "Market Development", "Professional", "Other"] },
      { name: "performance_metric", label: "Performance Metric", type: "text" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "image_file_id", label: "Image", type: "linked-image", wide: true, fileKind: "achievements" },
      { name: "document_file_id", label: "Supporting Document", type: "linked-document", wide: true, fileKind: "achievements" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: PUBLISH, required: true },
    ],
    filters: [{ key: "category", label: "Category", options: ["Sales", "Leadership", "Team Development", "Market Development", "Professional", "Other"] }],
    searchKeys: ["title", "category", "year"], actions: ["edit", "delete", "preview"], rows: [],
  },
  activities: {
    key: "activities", table: "activities", title: "Activities", singular: "activity",
    description: "Leadership activities such as meetings, trainings and events.",
    addLabel: "Add Activity", emptyTitle: "No activities added yet.",
    emptyMessage: "Leadership activities will appear here once added.",
    columns: [
      { key: "title", label: "Title" }, { key: "date", label: "Date", kind: "date" },
      { key: "location", label: "Location" }, { key: "category", label: "Category" },
      { key: "status", label: "Status", kind: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "date", label: "Date", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "category", label: "Category", type: "select", required: true,
        options: ["Team Meetings", "Training Programs", "Sales Conferences", "CME / Professional Events", "Field Coaching", "Strategic Meetings", "Team Development", "Corporate Events"] },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", options: PUBLISH, required: true },
    ],
    filters: [{ key: "category", label: "Category", options: ["Team Meetings", "Training Programs", "Sales Conferences", "CME / Professional Events", "Field Coaching", "Strategic Meetings", "Team Development", "Corporate Events"] }],
    searchKeys: ["title", "location", "category"], actions: ["edit", "delete", "preview"], rows: [],
  },
};
