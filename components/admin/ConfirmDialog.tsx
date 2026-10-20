"use client";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open, onCancel, onConfirm, busy, message = "Are you sure you want to delete this item?", detail,
}: { open: boolean; onCancel: () => void; onConfirm: () => void; busy?: boolean; message?: string; detail?: string }) {
  return (
    <Modal open={open} onClose={onCancel} title="Confirm deletion"
      footer={<>
        <button onClick={onCancel} disabled={busy} className="px-4 py-2 text-sm border border-navy/20 text-navy hover:bg-navy/5">Cancel</button>
        <button onClick={onConfirm} disabled={busy} className="px-4 py-2 text-sm bg-red-700 text-white hover:bg-red-800 disabled:opacity-60">
          {busy ? "Deleting…" : "Delete"}
        </button>
      </>}>
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-navy font-medium">{message}</p>
          {detail && <p className="mt-1 text-sm text-charcoal/70 break-words">{detail}</p>}
          <p className="mt-2 text-sm text-charcoal/60">This action cannot be undone.</p>
        </div>
      </div>
    </Modal>
  );
}
