"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Replace, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteFile, getDownloadUrl, listFiles, replaceFile, uploadFile } from "@/app/admin/file-actions";
import { isSessionError } from "@/lib/admin/session";
import type { FileKind } from "@/lib/files/validate";

type Item = { id: string; original_name: string; mime_type: string; file_size: number; is_public: boolean; created_at: string };
const accept: Record<FileKind, string> = {
  profile: ".jpg,.jpeg,.png,.webp", gallery: ".jpg,.jpeg,.png,.webp", documents: ".pdf,.docx,.pptx",
  achievements: ".jpg,.jpeg,.png,.webp,.pdf,.docx,.pptx",
  team: ".jpg,.jpeg,.png,.webp",
};
// Rendered only inside /admin. Every action is re-verified server-side; hiding buttons is UX, not security.
export default function FileLibrary({ kind, onUploaded }: { kind: FileKind; onUploaded?: (file: { id: string }) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPublic, setIsPublic] = useState(kind === "profile"); // profile photos are almost always meant to be public
  const upRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const load = useCallback(async () => { try { setItems((await listFiles(kind)) as Item[]); } catch (e: any) { setMsg({ ok: false, text: "Not authorised or failed to load" }); } }, [kind]);
  useEffect(() => { load(); }, [load]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: `${label} done` }); await load(); }
    catch (e: any) {
      if (isSessionError(e)) { router.push("/admin/login?expired=1"); return; }
      setMsg({ ok: false, text: e?.message || `${label} failed` });
    }
    finally { setBusy(null); }
  }
  const pick = (label: string, cb: (fd: FormData) => Promise<{ id: string }>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    const fd = new FormData(); fd.set("file", f); fd.set("isPublic", String(isPublic));
    run(label, async () => { const result = await cb(fd); onUploaded?.(result); });
  };
  const download = (id: string) => run("Download", async () => {
    const { url } = await getDownloadUrl(id);       // 60-second signed URL
    const a = document.createElement("a"); a.href = url; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--gold-soft)] bg-white p-4">
        <input ref={upRef} type="file" hidden accept={accept[kind]} onChange={pick("Upload", (fd) => uploadFile(kind, fd))} />
        <button onClick={() => upRef.current?.click()} disabled={!!busy} className="inline-flex items-center gap-2 rounded bg-[var(--navy)] px-4 py-2 text-sm text-white disabled:opacity-50"><Upload size={16} />Upload</button>
        {(kind === "gallery" || kind === "profile" || kind === "achievements") && (
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />Show optimized copy on public website</label>
        )}
        <span className="text-xs text-slate-500">Originals stay private. Max size and type are verified on the server.</span>
      </div>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>}
      <ul className="divide-y rounded-lg border bg-white">
        {items.length === 0 && <li className="p-6 text-sm text-slate-500">No files yet.</li>}
        {items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="text-sm font-medium">{it.original_name}</p>
              <p className="text-xs text-slate-500">{(it.file_size / 1024).toFixed(0)} KB · {it.is_public ? "Public copy shown" : "Private only"}</p></div>
            <div className="flex gap-2">
              <button onClick={() => download(it.id)} disabled={!!busy} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm"><Download size={14} />Download Original</button>
              <label className="inline-flex cursor-pointer items-center gap-1 rounded border px-3 py-1.5 text-sm"><Replace size={14} />Replace
                <input type="file" hidden accept={accept[kind]} onChange={pick("Replace", (fd) => replaceFile(it.id, fd))} /></label>
              <button onClick={() => confirm(`Delete "${it.original_name}" permanently? This cannot be undone.`) && run("Delete", () => deleteFile(it.id))} disabled={!!busy} className="inline-flex items-center gap-1 rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"><Trash2 size={14} />Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
