"use client";
import type { Field, Option } from "@/lib/admin/types";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormSelect from "./FormSelect";
import ImageUploader from "./ImageUploader";
import FileUploader from "./FileUploader";
import LinkedFileField from "./LinkedFileField";

// Renders any config Field. `onChange` receives a patch so file fields can
// also record size/type/preview alongside the name. `table` is only needed for
// linked-image/linked-document fields (LinkedFileField writes straight to that table's row).
export default function FieldControl({ field, values, error, options, onChange, disabled, table }: {
  field: Field; values: Record<string, any>; error?: string; options: Option[];
  onChange: (patch: Record<string, any>) => void; disabled?: boolean; table?: string;
}) {
  const id = `f-${field.name}`;
  const v = values[field.name] ?? "";
  const common = { id, label: field.label, error, help: field.help, wide: field.wide, required: field.required };

  if (field.type === "textarea" || field.type === "list")
    return <FormTextarea {...common} value={v} disabled={disabled} placeholder={field.placeholder} onChange={(e) => onChange({ [field.name]: e.target.value })} />;
  if (field.type === "select")
    return <FormSelect {...common} value={v} options={options} disabled={disabled} onChange={(e) => onChange({ [field.name]: e.target.value })} />;
  if (field.type === "image")
    return <ImageUploader {...common} value={v} preview={values[`${field.name}_preview`]}
      onChange={(f) => onChange({ [field.name]: f?.name ?? "", [`${field.name}_preview`]: f?.preview ?? "" })} />;
  if (field.type === "linked-image" || field.type === "linked-document")
    return <LinkedFileField field={field} table={table ?? ""} recordId={values.id ?? null} currentId={v || null}
      disabled={disabled} onChange={(id) => onChange({ [field.name]: id })} />;
  if (field.type === "file")
    return <FileUploader {...common} value={v} size={values[`${field.name}_size`]}
      onChange={(f) => onChange({ [field.name]: f?.name ?? "", [`${field.name}_size`]: f?.size ?? 0, [`${field.name}_type`]: f ? (f.name.split(".").pop() ?? "").toUpperCase() : "" })} />;
  return <FormInput {...common} type={field.type} value={v} disabled={disabled} placeholder={field.placeholder}
    onChange={(e) => onChange({ [field.name]: e.target.value })} />;
}
