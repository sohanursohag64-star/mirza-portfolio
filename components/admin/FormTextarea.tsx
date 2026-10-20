import type { TextareaHTMLAttributes } from "react";
import FormField, { controlClass } from "./FormField";

type Props = { id: string; label: string; error?: string; help?: string; wide?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function FormTextarea({ id, label, error, help, wide, required, rows = 4, ...rest }: Props) {
  return (
    <FormField id={id} label={label} required={required} help={help} error={error} wide={wide}>
      <textarea id={id} rows={rows} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : help ? `${id}-help` : undefined}
        className={controlClass(error)} {...rest} />
    </FormField>
  );
}
