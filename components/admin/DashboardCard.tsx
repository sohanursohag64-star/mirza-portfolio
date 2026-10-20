import type { ReactNode } from "react";
import Link from "next/link";

export default function DashboardCard({ label, value, icon, href, note }: { label: string; value: ReactNode; icon: ReactNode; href?: string; note?: string }) {
  const body = (
    <div className="border border-navy/10 bg-white p-5 h-full hover:border-gold-line/70 transition-colors">
      <div className="flex items-center justify-between text-gold">{icon}</div>
      <p className="font-display text-3xl text-navy mt-4 leading-none">{value}</p>
      <p className="mt-2 text-sm text-charcoal/65">{label}</p>
      {note && <p className="mt-1 text-[11px] text-charcoal/45">{note}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}
