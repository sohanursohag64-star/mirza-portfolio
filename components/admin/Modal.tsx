"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  open, onClose, title, children, footer, wide,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-deep/60 p-0 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`bg-white w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} max-h-[92vh] flex flex-col outline-none shadow-xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <h2 className="font-display text-lg text-navy">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-navy/60 hover:text-navy"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-navy/10 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
