"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, FileText, Upload, Replace, X } from "lucide-react";
import { uploadFile, replaceFile } from "@/app/admin/file-actions";
import { updateRecord } from "@/app/admin/actions";
import { isSessionError } from "@/lib/admin/session";
import type { Field } from "@/lib/admin/types";
import type { FileKind } from "@/lib/files/validate";

const ACCEPT: Record<"linked-image" | "linked-document", string> = {
  "linked-image": ".jpg,.jpeg,.png,.webp",
  "linked-document": ".pdf,.docx,.pptx",
};

// A single file attached to one specific table row via a *_file_id column (team_members.photo_file_id,
// achievements.image_file_id, achievements.document_file_id). Unlike FileLibrary (a flat list of files
// for a whole kind), this always writes the new file's id straight back onto that one row.
export default function LinkedFileField({ field, table, recordId, currentId, disabled, onChange }: {
  field: Field; table: string; recordId: string | null; currentId: string | null; disabled?: boolean;
  onChange: (id: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const isImage = field.type === "linked-image";
  const kind = (field.fileKind ?? "achievements") as FileKind;

  async function handle(label: string, run: () => Promise<{ id: string } | null>) {
    setBusy(true); setErr(null);
    try {
      const result = await run();
      onChange(result?.id ?? null);
    } catch (e) {
      if (isSessionError(e)) { router.push("/admin/login?expired=1"); return; }
      setErr(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy(false);
    }
  }

  const pick = (label: string, cb: (fd: FormData) => Promise<{ id: string }>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f || !recordId) return;
    const fd = new FormData(); fd.set("file", f); fd.set("isPublic", "true");
    handle(label, async () => {
      const uploaded = await cb(fd);
      await updateRecord(table, recordId, { [field.name]: uploaded.id });
      return uploaded;
    });
  };
  const remove = () => handle("Remove", async () => {
    if (!recordId) return null;
    await updateRecord(table, recordId, { [field.name]: null });
    return null;
  });

  if (!recordId) {
    return (
      <div className={field.wide ? "sm:col-span-2" : ""}>
        <p className="text-xs uppercase tracking-wide text-navy/50 mb-1.5">{field.label}</p>
        <p className="text-sm text-charcoal/50 border border-dashed border-navy/15 px-4 py-3">Save this record first, then come back to attach {isImage ? "a photo" : "a document"}.</p>
      </div>
    );
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-wide text-navy/50 mb-1.5">{field.label}</p>
      <div className="flex items-center gap-3">
        {currentId && isImage && (
          <img src={`/api/public-image/${currentId}`} alt="" className="w-12 h-12 rounded object-cover border border-navy/15"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        )}
        {currentId && !isImage && (
          <span className="inline-flex items-center gap-1.5 text-sm text-charcoal/70"><FileText className="w-4 h-4" strokeWidth={1.5} />Document attached</span>
        )}
        {!currentId && (
          <span className="inline-flex items-center gap-1.5 text-sm text-charcoal/40">
            {isImage ? <ImageIcon className="w-4 h-4" strokeWidth={1.5} /> : <FileText className="w-4 h-4" strokeWidth={1.5} />}
            None attached
          </span>
        )}
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-navy/20 px-3 py-1.5 text-xs text-navy hover:border-gold">
          {currentId ? <Replace className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
          {currentId ? "Replace" : "Upload"}
          <input type="file" hidden accept={ACCEPT[field.type as "linked-image" | "linked-document"]} disabled={disabled || busy}
            onChange={pick(currentId ? "Replace" : "Upload", (fd) => currentId ? replaceFile(currentId, fd) : uploadFile(kind, fd))} />
        </label>
        {currentId && (
          <button type="button" disabled={disabled || busy} onClick={remove} className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800"><X className="w-3.5 h-3.5" />Remove</button>
        )}
      </div>
      {err && <p className="mt-1.5 text-xs text-red-700">{err}</p>}
    </div>
  );
}
