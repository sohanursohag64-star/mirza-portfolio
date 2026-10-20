"use client";
// ---------------------------------------------------------------------------
// SUPABASE DATA LAYER — backed by real PostgreSQL database.
// All CRUD operations call server actions that write to Supabase.
// ---------------------------------------------------------------------------
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isSessionError } from "@/lib/admin/session";
import { resources } from "@/lib/admin/resources";
import { createRecord, updateRecord, deleteRecord, fetchRecords, updateProfile, updateContact } from "@/app/admin/actions";
import type { Row } from "@/lib/admin/types";

interface AdminData {
  ready: boolean;
  rows: (key: string) => Row[];
  reload: (key: string) => Promise<void>;
  create: (key: string, values: Omit<Row, "id">) => Promise<Row>;
  update: (key: string, id: string, values: Partial<Row>) => Promise<void>;
  remove: (key: string, id: string) => Promise<void>;
}
const Ctx = createContext<AdminData | null>(null);
export const useAdminData = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminData must be used inside AdminDataProvider");
  return c;
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const router = useRouter();

  // A server action rejecting with UNAUTHENTICATED/FORBIDDEN means the session ended since
  // the page loaded (expiry, sign-out elsewhere, or a revoked admin). Bounce to login with
  // the same message middleware shows, instead of surfacing a raw "FORBIDDEN" error.
  const redirectIfExpired = useCallback((err: unknown) => {
    if (isSessionError(err)) { router.push("/admin/login?expired=1"); return true; }
    return false;
  }, [router]);

  // Load initial data from database
  const load = useCallback(async (key: string) => {
    try {
      const config = resources[key];
      const rows = await fetchRecords(config.table);
      setData((d) => ({ ...d, [key]: rows }));
      setErrors((e) => ({ ...e, [key]: null }));
    } catch (err) {
      if (redirectIfExpired(err)) return;
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrors((e) => ({ ...e, [key]: msg }));
    }
  }, [redirectIfExpired]);

  useEffect(() => {
    const initAll = async () => {
      // Load all resource tables on mount
      await Promise.all(Object.keys(resources).map((k) => load(k)));
      setReady(true);
    };
    initAll();
  }, [load]);

  const value: AdminData = {
    ready,
    rows: (key) => data[key] ?? [],
    reload: load,
    async create(key, values) {
      const config = resources[key];
      try {
        const row = await createRecord(config.table, values);
        setData((d) => ({ ...d, [key]: [...(d[key] ?? []), row] }));
        return row;
      } catch (err) { if (redirectIfExpired(err)) return undefined as unknown as Row; throw err; }
    },
    async update(key, id, values) {
      const config = resources[key];
      try {
        await updateRecord(config.table, id, values);
        setData((d) => ({ ...d, [key]: d[key].map((r) => (r.id === id ? { ...r, ...values } : r)) }));
      } catch (err) { if (!redirectIfExpired(err)) throw err; }
    },
    async remove(key, id) {
      const config = resources[key];
      try {
        await deleteRecord(config.table, id);
        setData((d) => ({ ...d, [key]: d[key].filter((r) => r.id !== id) }));
      } catch (err) { if (!redirectIfExpired(err)) throw err; }
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
