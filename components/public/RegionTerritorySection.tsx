"use client";

import { useState } from "react";
import { useRegions, useTeamMembers, useTerritories } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";
import { ChevronDown, Map, Users } from "lucide-react";

export default function RegionTerritorySection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: regions } = useRegions() as { data: any[] };
  const { data: territories } = useTerritories() as { data: any[] };
  const { data: teamMembers } = useTeamMembers() as { data: any[] };

  return (
    <section id="regions" className="section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Regional Leadership" />

        <div className="mt-10 space-y-3 max-w-3xl">
          {regions.map((r) => {
            const open = openId === r.id;
            const regionTerritories = territories.filter((t) => t.region_id === r.id);
            const teamCount = teamMembers.filter((m) => m.region_id === r.id).length;
            return (
              <div key={r.id} className="border border-navy/10 bg-paper">
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <div>
                    <p className="text-navy font-medium">{r.name}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-xs text-charcoal/60">
                      <span className="inline-flex items-center gap-1.5">
                        <Map className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {regionTerritories.length} Territories
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {teamCount} Team Members
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gold shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-6 pt-1 border-t border-navy/10 text-sm text-charcoal/70">
                    {regionTerritories.length > 0 ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {regionTerritories.map((t) => (
                          <li key={t.id} className="border border-navy/10 bg-offwhite px-3 py-1 text-xs text-navy">{t.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-charcoal/50">Territory details will be added through the Admin Panel.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
