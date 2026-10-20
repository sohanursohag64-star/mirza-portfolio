"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Eye, ImageIcon, Pencil, Plus, Trash2, RefreshCw } from "lucide-react";
import { resources } from "@/lib/admin/resources";
import { validate } from "@/lib/admin/validate";
import type { Column, Field, Option, Row } from "@/lib/admin/types";
import { useAdminData } from "./AdminDataProvider";
import { useToast } from "./ToastNotification";
import DataTable, { Pagination, type SortState } from "./DataTable";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import FieldControl from "./FieldControl";
import { useRouter } from "next/navigation";
import { isSessionError } from "@/lib/admin/session";

const PAGE_SIZE = 8;

const statusStyle = (s: string) =>
  /^(active|published|current)$/i.test(s) ? "bg-emerald-600/10 text-emerald-800"
  : /^(inactive|draft|previous)$/i.test(s) ? "bg-charcoal/10 text-charcoal/70"
  : "bg-amber-500/10 text-amber-800";

const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtSize = (n?: number) => (n ? (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : "—");

export default function ResourceManager({ resource }: { resource: string }) {
  const config = resources[resource];
  const store = useAdminData();
  const { notify } = useToast();
  const rows = store.rows(config.key);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ row: Row | null } | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const [view, setView] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  // Quick actions link here with ?new=1 to open the add form.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") setForm({ row: null });
  }, []);

  const optionsFor = (f: { options?: string[]; optionsFrom?: string }): Option[] => {
    if (f.options) return f.options.map((o) => ({ value: o, label: o }));
    if (!f.optionsFrom) return [];
    const list = store.rows(f.optionsFrom);
    return list.map((r) => {
      const dup = list.filter((x) => x.name === r.name).length > 1;
      return { value: r.id, label: dup ? `${r.name} #${r.display_order ?? ""}` : r.name };
    });
  };
  const nameOf = (res: string, id?: string) => store.rows(res).find((r) => r.id === id)?.name;

  const cell = (c: Column, r: Row): ReactNode => {
    const v = r[c.key];
    switch (c.kind) {
      case "status": return v ? <span className={`inline-block px-2.5 py-0.5 text-xs ${statusStyle(v)}`}>{v}</span> : "—";
      case "image": {
        const src = r[`${c.key}_preview`];
        return <div className="w-10 h-10 bg-navy/5 flex items-center justify-center overflow-hidden rounded-sm">
          {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-navy/30" />}
        </div>;
      }
      case "linked-image": {
        return <div className="w-10 h-10 bg-navy/5 flex items-center justify-center overflow-hidden rounded-sm">
          {v ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/public-image/${v}`} alt="" className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : <ImageIcon className="w-4 h-4 text-navy/30" />}
        </div>;
      }
      case "lookup": return nameOf(c.lookup!, v) ?? <span className="text-navy/40">—</span>;
      case "count": return store.rows(c.countBy!.resource).filter((x) => x[c.countBy!.field] === r.id).length;
      case "period": return r.start_date || r.end_date
        ? `${fmtDate(r.start_date)} → ${r.status === "Current" && !r.end_date ? "Present" : fmtDate(r.end_date)}`
        : <span className="text-navy/45 italic">Dates not added</span>;
      case "date": return fmtDate(v);
      case "size": return fmtSize(r.file_size);
      default: return v ? <span className="line-clamp-2">{String(v)}</span> : <span className="text-navy/40">—</span>;
    }
  };

  const shown = useMemo(() => {
    let out = rows.filter((r) => {
      const hit = !q || config.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase()));
      return hit && Object.entries(filters).every(([k, val]) => !val || r[k] === val);
    });
    if (sort) out = [...out].sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true }) * (sort.dir === "asc" ? 1 : -1));
    return out;
  }, [rows, q, filters, sort, config.searchKeys]);

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const pageRows = shown.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);

  const router = useRouter();
  const confirmDelete = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await store.remove(config.key, del.id);
      notify("success", "Deleted.");
      setDel(null);
    } catch (e) {
      if (isSessionError(e)) { router.push("/admin/login?expired=1"); return; }
      notify("error", e instanceof Error ? e.message : "Could not delete. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const actionButtons = (r: Row) => {
    const btn = "p-2 text-navy/60 hover:text-navy hover:bg-navy/5";
    const has = (a: string) => config.actions.includes(a as never);
    return <>
      {has("preview") && <button className={btn} aria-label={`Preview ${config.singular}`} title="Preview" onClick={() => setView(r)}><Eye className="w-4 h-4" /></button>}
      {has("download") && <button className={btn} aria-label="Download" title="Download" onClick={() => notify("info", "Use the Gallery or Documents page to download original files.")}><Download className="w-4 h-4" /></button>}
      {has("replace") && <button className={btn} aria-label="Replace file" title="Replace" onClick={() => setForm({ row: r })}><RefreshCw className="w-4 h-4" /></button>}
      {has("edit") && <button className={btn} aria-label={`Edit ${config.singular}`} title="Edit" onClick={() => setForm({ row: r })}><Pencil className="w-4 h-4" /></button>}
      {has("delete") && <button className="p-2 text-red-700/70 hover:text-red-700 hover:bg-red-50" aria-label={`Delete ${config.singular}`} title="Delete" onClick={() => setDel(r)}><Trash2 className="w-4 h-4" /></button>}
    </>;
  };

  const openAdd = () => setForm({ row: null });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy">{config.title}</h1>
          <p className="mt-1 text-sm text-charcoal/65 max-w-xl">{config.description}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 bg-navy text-offwhite px-5 py-2.5 text-sm font-medium hover:bg-navy-light shrink-0">
          <Plus className="w-4 h-4" /> {config.addLabel}
        </button>
      </div>

      {config.notice && <p className="mt-4 border-l-2 border-gold bg-offwhite px-4 py-3 text-sm text-charcoal/80">{config.notice}</p>}

      {!store.ready ? <LoadingState /> : rows.length === 0 ? (
        <div className="mt-8"><EmptyState title={config.emptyTitle} message={config.emptyMessage} actionLabel="+ Add New" onAction={openAdd} /></div>
      ) : (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={`Search ${config.title.toLowerCase()}…`} />
            {config.filters?.map((f) => (
              <FilterDropdown key={f.key} label={f.label} value={filters[f.key] ?? ""} options={optionsFor(f)}
                onChange={(v) => { setFilters((s) => ({ ...s, [f.key]: v })); setPage(1); }} />
            ))}
          </div>
          <div className="mt-4">
            {shown.length === 0 ? (
              <EmptyState title="No results match your search." message="Try a different keyword or clear the filters."
                actionLabel="Clear filters" onAction={() => { setQ(""); setFilters({}); }} />
            ) : (
              <>
                <DataTable columns={config.columns} rows={pageRows} renderCell={cell} actions={actionButtons}
                  sort={sort} onSort={(k) => setSort((s) => (s?.key === k ? (s.dir === "asc" ? { key: k, dir: "desc" } : null) : { key: k, dir: "asc" }))} />
                <Pagination page={Math.min(page, pages)} pages={pages} total={shown.length} onPage={setPage} />
              </>
            )}
          </div>
        </div>
      )}

      {form && <RecordForm key={form.row?.id ?? "new"} resource={resource} row={form.row} optionsFor={optionsFor} onClose={() => setForm(null)} />}

      <ConfirmDialog open={!!del} busy={busy} onCancel={() => setDel(null)} onConfirm={confirmDelete}
        detail={del ? String(del.title ?? del.name ?? del.organization ?? del.file ?? "") : undefined} />

      <Modal open={!!view} onClose={() => setView(null)} title={`Preview ${config.singular}`} wide
        footer={<button onClick={() => setView(null)} className="px-4 py-2 text-sm border border-navy/20 text-navy hover:bg-navy/5">Close</button>}>
        {view && (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            {config.fields.map((f) => (
              <div key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
                <dt className="text-xs uppercase tracking-wide text-navy/50">{f.label}</dt>
                <dd className="mt-1 text-charcoal break-words">{Array.isArray(view[f.name]) ? view[f.name].join(", ") : view[f.name] || "—"}</dd>
              </div>
            ))}

          </dl>
        )}
      </Modal>
    </div>
  );
}

function RecordForm({ resource, row, optionsFor, onClose }: {
  resource: string; row: Row | null; optionsFor: (f: Field) => Option[]; onClose: () => void;
}) {
  const config = resources[resource];
  const store = useAdminData();
  const { notify } = useToast();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = { ...(row ?? {}) };
    for (const f of config.fields) {
      if (f.type === "list") init[f.name] = Array.isArray(init[f.name]) ? init[f.name].join("\n") : "";
      else if (f.type === "select" && !row && !f.optionsFrom && f.options) init[f.name] = f.options[0];
    }
    if (!row && config.fields.some((f) => f.name === "display_order")) init.display_order = store.rows(config.key).length + 1;
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(config.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) { notify("error", "Please fix the highlighted fields."); return; }
    const out: Record<string, any> = { ...values };
    for (const f of config.fields) {
      if (f.type === "list") out[f.name] = String(values[f.name] ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      if (f.name === "display_order") out.display_order = Number(values.display_order) || 0;
      // linked-image/linked-document fields already persist themselves (LinkedFileField calls
      // updateRecord as soon as a file is attached) — don't resend them as part of this save.
      if ((f.type === "linked-image" || f.type === "linked-document") && row) delete out[f.name];
    }
    setSaving(true);
    try {
      if (row) await store.update(config.key, row.id, out);
      else await store.create(config.key, out);
      notify("success", "Saved.");
      onClose();
    } catch (err) {
      if (isSessionError(err)) { router.push("/admin/login?expired=1"); return; }
      notify("error", err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={saving ? () => {} : onClose} wide title={row ? `Edit ${config.singular}` : config.addLabel}
      footer={<>
        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm border border-navy/20 text-navy hover:bg-navy/5">Cancel</button>
        <button type="submit" form="record-form" disabled={saving} className="px-5 py-2 text-sm bg-navy text-offwhite hover:bg-navy-light disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </>}>
      <form id="record-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
        {config.fields.map((f) => (
          <FieldControl key={f.name} field={f} values={values} error={errors[f.name]} options={optionsFor(f)}
            disabled={saving} table={config.table} onChange={(p) => setValues((v) => ({ ...v, ...p }))} />
        ))}
      </form>
    </Modal>
  );
}
