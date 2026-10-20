"use client";

import { useEffect, useRef, useState } from "react";
import { useStatistics } from "@/lib/supabase/hooks";
import { Briefcase, Users, Map, Layers, type LucideIcon } from "lucide-react";

const statIcon: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  users: Users,
  map: Map,
  layers: Layers,
};

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

export function StatisticsCard({
  icon,
  value,
  label,
  active,
}: {
  icon: string;
  value: string;
  label: string;
  active: boolean;
}) {
  const Icon = statIcon[icon];
  const numeric = parseInt(value, 10);
  const suffix = value.replace(String(numeric), "");
  const count = useCountUp(numeric, active);

  return (
    <div className="group border border-navy/10 bg-paper p-6 sm:p-7 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(11,31,58,0.18)]">
      <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
      <p className="font-display text-4xl sm:text-[2.75rem] text-navy mt-4 leading-none">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-charcoal/70">{label}</p>
    </div>
  );
}

export default function StatisticsSection() {
  const { data: stats } = useStatistics();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-offwhite section-pad py-16 sm:py-20">
      <div ref={ref} className="max-w-content mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s: any) => (
          <StatisticsCard key={s.title} icon={s.icon} value={s.value} label={s.title} active={active} />
        ))}
      </div>
    </section>
  );
}
