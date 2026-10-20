import type { SelectHTMLAttributes } from "react";
import type { Option } from "@/lib/admin/types";
import FormField, { controlClass } from "./FormField";

type Props = { id: string; label: string; options: Option[]; error?: string; help?: string; wide?: boolean; placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>;

export default function FormSelect({ id, label, options, error, help, wide, required, placeholder = "Select…", ...rest }: Props) {
  return (
    <FormField id={id} label={label} required={required} help={help} error={error} wide={wide}>
      <select id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : help ? `${id}-help` : undefined}
        className={controlClass(error)} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {options.length === 0 && <p className="mt-1 text-xs text-charcoal/55">No options yet — add records in the related section first.</p>}
    </FormField>
  );
}
