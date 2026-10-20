export default function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="py-16 flex flex-col items-center gap-3 text-navy/60 text-sm">
      <span className="w-6 h-6 rounded-full border-2 border-navy/15 border-t-gold animate-spin" />
      {label}
    </div>
  );
}
