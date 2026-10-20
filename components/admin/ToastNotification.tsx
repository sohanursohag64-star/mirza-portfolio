"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";
interface Toast { id: number; kind: Kind; message: string }
const Ctx = createContext<{ notify: (kind: Kind, message: string) => void }>({ notify: () => {} });
export const useToast = () => useContext(Ctx);

const styles: Record<Kind, string> = {
  success: "border-emerald-600/30 text-emerald-900",
  error: "border-red-600/30 text-red-900",
  info: "border-navy/20 text-navy",
};
const icons = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const notify = useCallback((kind: Kind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => dismiss(id), 5000);
  }, []);
  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div role="status" aria-live="polite" className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 sm:w-96">
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <div key={t.id} className={`bg-white border shadow-md px-4 py-3 flex items-start gap-3 text-sm ${styles[t.kind]}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="flex-1">{t.message}</p>
              <button aria-label="Dismiss" onClick={() => dismiss(t.id)}><X className="w-4 h-4 opacity-60" /></button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
