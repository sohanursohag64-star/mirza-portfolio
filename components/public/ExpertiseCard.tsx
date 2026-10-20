"use client";
import { useExpertise } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";
import {
  Target,
  Users,
  Map,
  BarChart,
  GraduationCap,
  TrendingUp,
  Globe,
  Stethoscope,
  Compass,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  map: Map,
  "bar-chart": BarChart,
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
  globe: Globe,
  stethoscope: Stethoscope,
  compass: Compass,
  "check-circle": CheckCircle,
};

export function ExpertiseCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const Icon = icons[icon] ?? Target;
  return (
    <div className="group border border-navy/10 bg-paper p-6 flex flex-col gap-4 transition-colors hover:border-gold-line/60 tilt-card">
      <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
      <div>
        <p className="text-navy font-medium text-sm leading-snug">{title}</p>
        <p className="mt-2 text-xs text-charcoal/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function ExpertiseSection() {
  const { data: expertise } = useExpertise() as { data: any[] };

  if (expertise.length === 0) return null;

  return (
    <section id="expertise" className="bg-paper section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Leadership & Professional Expertise" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {expertise.map((e) => (
            <ExpertiseCard key={e.id} icon={e.icon} title={e.title} description={e.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
