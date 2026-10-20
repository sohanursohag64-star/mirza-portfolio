"use client";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import type { Column, Row } from "@/lib/admin/types";

export interface SortState { key: string; dir: "asc" | "desc" }

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-charcoal/70">
      <p>Page {page} of {pages} · {total} {total === 1 ? "item" : "items"}</p>
      <div className="flex gap-2">
        <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-2 border border-navy/15 disabled:opacity-40 hover:border-gold"><ChevronLeft className="w-4 h-4" /></button>
        <button aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-2 border border-navy/15 disabled:opacity-40 hover:border-gold"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// Desktop: table. Mobile: one card per row (first column becomes the title).
export default function DataTable({ columns, rows, renderCell, actions, sort, onSort }: {
  columns: Column[]; rows: Row[]; renderCell: (c: Column, r: Row) => ReactNode;
  actions: (r: Row) => ReactNode; sort: SortState | null; onSort: (key: string) => void;
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto border border-navy/10">
        <table className="w-full text-sm">
          <thead className="bg-offwhite text-left text-xs uppercase tracking-wide text-navy/60">
            <tr>
              {columns.map((c) => {
                const sortable = c.sortable !== false;
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined} className="px-4 py-3 font-medium">
                    {sortable ? (
                      <button onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-navy">
                        {c.label}
                        {active ? (sort!.dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                      </button>
                    ) : c.label}
                  </th>
                );
              })}
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-offwhite/60">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 align-middle text-charcoal">{renderCell(c, r)}</td>)}
                <td className="px-4 py-3"><div className="flex justify-end gap-1">{actions(r)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="border border-navy/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-medium text-navy">{renderCell(columns.find((c) => c.kind !== "image") ?? columns[0], r)}</div>
              <div className="flex shrink-0 -mr-2 -mt-1">{actions(r)}</div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {columns.filter((c) => c !== (columns.find((x) => x.kind !== "image") ?? columns[0])).map((c) => (
                <div key={c.key}><dt className="text-navy/50">{c.label}</dt><dd className="text-charcoal mt-0.5">{renderCell(c, r)}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
