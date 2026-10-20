"use client";
import { useTeamMembers } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";
import { User, MapPin } from "lucide-react";

const statusStyle: Record<string, string> = {
  Active: "border-gold-line text-gold",
  "On Leave": "border-amber-400/60 text-amber-700",
  "Position Open": "border-navy/15 text-navy/40",
};

export default function TeamGrid() {
  const { data: teamMembers } = useTeamMembers() as { data: any[] };

  return (
    <section id="team" className="bg-paper section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Team Leadership" />

        {teamMembers.length === 0 ? (
          <p className="mt-10 text-charcoal/60 text-sm">Team members will be added through the Admin Panel.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {teamMembers.map((m) => {
              const regionName = m.regions?.name;
              const territoryName = m.territories?.name;
              return (
                <div key={m.id} className="border border-navy/10 bg-offwhite/40 p-6 tilt-card">
                  {m.photo_file_id ? (
                    <img
                      src={`/api/public-image/${m.photo_file_id}`}
                      alt={m.name}
                      className="w-16 h-16 rounded-full object-cover border border-navy/10"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-navy/5 border border-navy/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-navy/30" strokeWidth={1.5} />
                    </div>
                  )}
                  <p className="font-display text-lg text-navy mt-4">{m.name}</p>
                  <p className="text-sm text-charcoal/60">{m.designation}</p>

                  {(regionName || territoryName) && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-charcoal/50">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {[regionName, territoryName].filter(Boolean).join(" · ")}
                    </div>
                  )}

                  {m.bio && <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">{m.bio}</p>}

                  <span
                    className={`inline-block mt-4 text-[11px] uppercase tracking-wide px-2.5 py-1 border ${
                      statusStyle[m.status] ?? "border-navy/15 text-navy/40"
                    }`}
                  >
                    {m.status ?? "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
