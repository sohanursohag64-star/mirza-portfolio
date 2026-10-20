"use client";
import { useRegions, useTeamMembers, useTerritories } from "@/lib/supabase/hooks";
import { leadershipScale } from "@/lib/data";
import { ChevronDown } from "lucide-react";

export default function LeadershipScaleSection() {
  const { data: regions } = useRegions() as { data: any[] };
  const { data: territories } = useTerritories() as { data: any[] };
  const { data: teamMembers } = useTeamMembers() as { data: any[] };
  // Derived from the same live tables the admin edits — never a separately maintained number
  // that could drift out of sync with what's actually in Regions / Territories / Team.
  const metrics = [
    { value: String(regions.length), label: "Regions" },
    { value: String(territories.length), label: "Territories" },
    { value: String(teamMembers.length), label: "Team Members" },
  ];
  const allEmpty = regions.length === 0 && territories.length === 0 && teamMembers.length === 0;

  return (
    <section id="leadership-scale" className="relative bg-navy text-offwhite section-pad py-20 sm:py-28 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F6F4EF 1px, transparent 1px), linear-gradient(to bottom, #F6F4EF 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative max-w-content mx-auto text-center">
        <p className="text-gold-soft text-sm tracking-wide">Scope of Responsibility</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-3 font-medium">
          {leadershipScale.heading}
        </h2>
        <p className="mt-5 text-offwhite/70 max-w-xl mx-auto leading-relaxed">
          {leadershipScale.intro}
        </p>

        <div className="mt-14 grid grid-cols-3 max-w-2xl mx-auto">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`px-4 sm:px-8 ${i > 0 ? "border-l border-gold-line/25" : ""}`}
            >
              <p className="font-display text-5xl sm:text-6xl">{m.value}</p>
              <p className="mt-3 text-xs sm:text-sm tracking-wide text-offwhite/60">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Visual hierarchy: Regions -> Territories -> Team Members */}
        <div className="mt-16 flex flex-col items-center gap-3 max-w-xs mx-auto text-sm">
          <div className="w-full border border-gold-line/30 bg-offwhite/[0.03] py-3">Regions</div>
          <ChevronDown className="w-4 h-4 text-gold-line" strokeWidth={1.5} />
          <div className="w-full border border-gold-line/30 bg-offwhite/[0.03] py-3">Territories</div>
          <ChevronDown className="w-4 h-4 text-gold-line" strokeWidth={1.5} />
          <div className="w-full border border-gold-line/30 bg-offwhite/[0.03] py-3">Team Members</div>
        </div>

        {allEmpty && <p className="mt-10 text-sm text-offwhite/50 italic">{leadershipScale.emptyState}</p>}
      </div>
    </section>
  );
}
