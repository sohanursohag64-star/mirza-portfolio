import type { InputHTMLAttributes } from "react";
import FormField, { controlClass } from "./FormField";

type Props = { id: string; label: string; error?: string; help?: string; wide?: boolean } & InputHTMLAttributes<HTMLInputElement>;

export default function FormInput({ id, label, error, help, wide, required, ...rest }: Props) {
  return (
    <FormField id={id} label={label} required={required} help={help} error={error} wide={wide}>
      <input id={id} required={false} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : help ? `${id}-help` : undefined}
        className={controlClass(error)} {...rest} />
    </FormField>
  );
}
