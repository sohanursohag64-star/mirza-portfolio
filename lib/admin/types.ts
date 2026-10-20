// Config-driven admin contracts. Every admin resource maps 1:1 to a future
// Supabase table (see `table`). Pages only pass a resource key; the generic
// ResourceManager renders table, filters, forms and dialogs from this config.

export type Row = { id: string; [key: string]: any };

export type FieldType =
  | "text" | "email" | "tel" | "url" | "number" | "date"
  | "textarea" | "list" | "select" | "image" | "file"
  | "linked-image" | "linked-document"; // real upload wired to a stored_files row, see LinkedFileField

export interface Option { value: string; label: string }

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  optionsFrom?: string; // another resource key (relation, e.g. regions)
  help?: string;
  wide?: boolean;
  fileKind?: "profile" | "gallery" | "documents" | "achievements" | "team"; // for linked-image / linked-document
}

export type ColumnKind =
  | "text" | "status" | "image" | "linked-image" | "lookup" | "count" | "period" | "date" | "size";

export interface Column {
  key: string;
  label: string;
  kind?: ColumnKind;
  lookup?: string; // resource key to resolve an id -> name
  countBy?: { resource: string; field: string }; // rows in `resource` whose `field` === this row id
  sortable?: boolean;
}

export interface FilterDef { key: string; label: string; options?: string[]; optionsFrom?: string }

export type RowAction = "edit" | "delete" | "preview" | "download" | "replace";

export interface ResourceConfig {
  key: string;
  table: string; // future Supabase table name
  title: string;
  singular: string;
  description: string;
  addLabel: string;
  emptyTitle: string;
  emptyMessage: string;
  columns: Column[];
  fields: Field[];
  filters?: FilterDef[];
  searchKeys: string[];
  actions: RowAction[];
  notice?: string;
  rows: Row[]; // initial preview rows — only confirmed data, never invented
}
