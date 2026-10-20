"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { retryOrphanedFiles } from "@/app/admin/file-actions";
import { isSessionError } from "@/lib/admin/session";
import { useToast } from "./ToastNotification";

export default function MaintenancePanel() {
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  async function run() {
    setBusy(true);
    try {
      const { cleaned, remaining } = await retryOrphanedFiles();
      notify("success", remaining ? `Cleared ${cleaned}, ${remaining} still stuck — try again shortly.` : cleaned ? `Cleared ${cleaned} leftover file(s).` : "Nothing to clean up.");
    } catch (err) {
      if (isSessionError(err)) { router.push("/admin/login?expired=1"); return; }
      notify("error", "Could not run cleanup. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={run} disabled={busy} className="mt-4 inline-block px-5 py-2.5 text-sm border border-navy/20 text-navy hover:border-gold disabled:opacity-60">
      {busy ? "Checking…" : "Retry leftover file cleanup"}
    </button>
  );
}
