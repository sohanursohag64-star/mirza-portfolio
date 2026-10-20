"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Field } from "@/lib/admin/types";
import { validate } from "@/lib/admin/validate";
import { useToast } from "./ToastNotification";
import { isSessionError } from "@/lib/admin/session";
import FieldControl from "./FieldControl";

export interface FormSection { title: string; description?: string; fields: Field[] }

// Generic multi-section form used by Profile and Contact. `onSave` is the real
// server action (updateProfile / updateContact) — this component no longer fakes success.
export default function SectionForm({ title, description, sections, initial, saveLabel = "Save Changes", onSave }: {
  title: string; description?: string; sections: FormSection[]; initial: Record<string, any>; saveLabel?: string;
  onSave: (values: Record<string, any>) => Promise<unknown>;
}) {
  const { notify } = useToast();
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const all = sections.flatMap((s) => s.fields);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(all, values);
    setErrors(errs);
    if (Object.keys(errs).length) return notify("error", "Please fix the highlighted fields.");
    setSaving(true);
    try {
      await onSave(values);
      notify("success", "Saved.");
    } catch (err) {
      if (isSessionError(err)) { router.push("/admin/login?expired=1"); return; }
      notify("error", err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="font-display text-3xl text-navy">{title}</h1>
      {description && <p className="mt-1 text-sm text-charcoal/65 max-w-xl">{description}</p>}
      <div className="mt-8 space-y-8 max-w-3xl">
        {sections.map((s) => (
          <fieldset key={s.title} className="border border-navy/10 p-5 sm:p-6">
            <legend className="px-2 font-display text-lg text-navy">{s.title}</legend>
            {s.description && <p className="text-sm text-charcoal/60 mb-4">{s.description}</p>}
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
              {s.fields.map((f) => (
                <FieldControl key={f.name} field={f} values={values} error={errors[f.name]} disabled={saving}
                  options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                  onChange={(p) => setValues((v) => ({ ...v, ...p }))} />
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm bg-navy text-offwhite hover:bg-navy-light disabled:opacity-60">
            {saving ? "Saving..." : saveLabel}
          </button>
          <button type="button" disabled={saving} onClick={() => { setValues(initial); setErrors({}); }} className="px-6 py-2.5 text-sm border border-navy/20 text-navy hover:bg-navy/5">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
