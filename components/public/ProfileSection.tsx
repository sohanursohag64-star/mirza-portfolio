"use client";
import { useProfile } from "@/lib/supabase/hooks";
import { profile as confirmedFacts, leadershipFocus } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import { Target, Users, MapPin, BarChart, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  "map-pin": MapPin,
  "bar-chart": BarChart,
};

export default function ProfileSection() {
  const { data: profile } = useProfile() as { data: any };

  return (
    <section id="about" className="section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Professional Profile" />
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 mt-10">
          <div className="space-y-5 text-charcoal/85 leading-relaxed">
            <p>{profile?.bio || confirmedFacts.intro}</p>
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-navy/60">Current Organization</p>
                <p className="mt-1 text-navy font-medium">{profile?.company ?? confirmedFacts.company}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-navy/60">Previous Organization</p>
                <p className="mt-1 text-navy font-medium">{profile?.previous_company ?? confirmedFacts.previousOrganization}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-navy/50 mb-4">Leadership Focus</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {leadershipFocus.map((f) => {
                const Icon = icons[f.icon];
                return (
                  <div
                    key={f.title}
                    className="border border-navy/10 bg-paper p-5 flex items-start gap-3.5 transition-colors hover:border-gold-line/60"
                  >
                    <Icon className="w-4.5 h-4.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm text-navy font-medium leading-snug">{f.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
