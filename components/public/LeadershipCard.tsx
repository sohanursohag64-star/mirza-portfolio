import { philosophy } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import { HeartHandshake, TrendingUp, Sprout, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "heart-handshake": HeartHandshake,
  "trending-up": TrendingUp,
  sprout: Sprout,
};

export function LeadershipCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const Icon = icons[icon];
  return (
    <div className="border border-navy/10 bg-paper p-7 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(11,31,58,0.16)]">
      <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-gold" strokeWidth={1.5} />
      </div>
      <p className="font-display text-lg text-navy mt-5">{title}</p>
      <p className="mt-3 text-sm text-charcoal/75 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function LeadershipSection() {
  return (
    <section id="leadership" className="bg-offwhite section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title={philosophy.heading} />
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {philosophy.pillars.map((p) => (
            <LeadershipCard key={p.title} icon={p.icon} title={p.title} description={p.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
