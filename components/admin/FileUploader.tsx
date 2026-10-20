"use client";
import { useRef } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import FormField from "./FormField";
import type { PickedFile } from "./ImageUploader";

// UI only: selection happens locally. Private storage is a later step.
export default function FileUploader({ id, label, value, size, onChange, error, required, help, wide }: {
  id: string; label: string; value?: string; size?: number; onChange: (f: PickedFile | null) => void;
  error?: string; required?: boolean; help?: string; wide?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <FormField id={id} label={label} required={required} error={error} help={help} wide={wide}>
      <div className={`border border-dashed p-4 flex items-center gap-4 ${error ? "border-red-600" : "border-navy/25"}`}>
        <FileText className="w-7 h-7 text-navy/35 shrink-0" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-navy truncate">{value || "No file selected"}{value && size ? ` · ${(size / 1024).toFixed(0)} KB` : ""}</p>
          <p className="text-xs text-charcoal/55 mt-0.5">PDF, Word, PowerPoint or image. Selected on this device only — private upload is not connected yet.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 text-sm border border-navy/25 px-3 py-1.5 text-navy hover:border-gold">
              <Upload className="w-3.5 h-3.5" /> {value ? "Replace" : "Choose file"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 text-red-700 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
        <input ref={input} id={id} type="file" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange({ name: f.name, size: f.size, type: f.type });
            e.target.value = "";
          }} />
      </div>
    </FormField>
  );
}
