import type { ReactNode } from "react";
import { Inbox, Plus } from "lucide-react";

export default function EmptyState({
  title, message, actionLabel = "Add New", onAction, icon,
}: { title: string; message?: string; actionLabel?: string; onAction?: () => void; icon?: ReactNode }) {
  return (
    <div className="border border-dashed border-navy/20 py-14 px-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center text-navy/60">
        {icon ?? <Inbox className="w-5 h-5" strokeWidth={1.5} />}
      </div>
      <p className="mt-4 font-display text-lg text-navy">{title}</p>
      {message && <p className="mt-1 text-sm text-charcoal/60 max-w-md mx-auto">{message}</p>}
      {onAction && (
        <button onClick={onAction} className="mt-6 inline-flex items-center gap-2 bg-navy text-offwhite px-5 py-2.5 text-sm font-medium hover:bg-navy-light">
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
