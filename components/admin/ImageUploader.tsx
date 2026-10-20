"use client";
import { useRef } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import FormField from "./FormField";

export interface PickedFile { name: string; size: number; type: string; preview?: string }

// UI only: the file is selected locally; nothing is uploaded until Supabase
// Storage is connected.
export default function ImageUploader({ id, label, value, preview, onChange, error, required, help, wide }: {
  id: string; label: string; value?: string; preview?: string; onChange: (f: PickedFile | null) => void;
  error?: string; required?: boolean; help?: string; wide?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <FormField id={id} label={label} required={required} error={error} help={help} wide={wide}>
      <div className={`border border-dashed p-4 flex items-center gap-4 ${error ? "border-red-600" : "border-navy/25"}`}>
        <div className="w-20 h-20 shrink-0 bg-navy/5 flex items-center justify-center overflow-hidden">
          {preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="Selected preview" className="w-full h-full object-cover" />
            : <ImageIcon className="w-6 h-6 text-navy/35" strokeWidth={1.5} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-navy truncate">{value || "No image selected"}</p>
          <p className="text-xs text-charcoal/55 mt-0.5">JPG, PNG or WebP. Selected on this device only — upload is not connected yet.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 text-sm border border-navy/25 px-3 py-1.5 text-navy hover:border-gold">
              <Upload className="w-3.5 h-3.5" /> {value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 text-red-700 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
        <input ref={input} id={id} type="file" accept="image/*" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange({ name: f.name, size: f.size, type: f.type, preview: URL.createObjectURL(f) });
            e.target.value = "";
          }} />
      </div>
    </FormField>
  );
}
