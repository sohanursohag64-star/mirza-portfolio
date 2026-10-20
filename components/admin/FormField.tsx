import type { ReactNode } from "react";

export const controlClass = (error?: string) =>
  `w-full bg-white border px-3.5 py-2.5 text-sm text-ink placeholder:text-navy/35 outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50 ${
    error ? "border-red-600" : "border-navy/20"
  }`;

export default function FormField({ id, label, required, help, error, children, wide }: {
  id: string; label: string; required?: boolean; help?: string; error?: string; children: ReactNode; wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="block text-sm font-medium text-navy mb-1.5">
        {label}{required && <span className="text-red-700" aria-hidden> *</span>}
      </label>
      {children}
      {help && !error && <p id={`${id}-help`} className="mt-1 text-xs text-charcoal/55">{help}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
