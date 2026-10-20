"use client";
import { useCareer, useProfile } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "Dates — Add from Admin Panel";
  const s = start ?? "—";
  const e = end ?? "Present";
  return `${s} — ${e}`;
}

export default function CareerTimeline() {
  const { data: career } = useCareer() as { data: any[] };
  const { data: profile } = useProfile() as { data: any };
  const experience = profile?.experience || "Multiple years of";

  return (
    <section id="career" className="section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading
          title="Career Journey"
          intro={`${experience} professional experience across pharmaceutical sales and leadership roles.`}
        />

        {career.length === 0 ? (
          <p className="mt-10 text-charcoal/60 text-sm">Career history will be added through the Admin Panel.</p>
        ) : (
          <div className="mt-12 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gold-line/50 hidden sm:block" />
            <ol className="space-y-10">
              {career.map((entry) => (
                <li key={entry.id} className="sm:pl-10 relative">
                  <span
                    className={`hidden sm:block absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
                      entry.end_date === null ? "bg-gold border-gold" : "bg-paper border-gold-line"
                    }`}
                  />
                  <div className="border border-navy/10 bg-paper p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs uppercase tracking-wide text-navy/60">
                        {formatRange(entry.start_date, entry.end_date)}
                      </p>
                      {entry.end_date === null && (
                        <span className="text-[11px] uppercase tracking-wide bg-gold/15 text-gold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      {entry.label && (
                        <span className="text-[11px] uppercase tracking-wide text-navy/40">
                          {entry.label}
                        </span>
                      )}
                    </div>

                    <p className="font-display text-xl text-navy mt-2">{entry.designation}</p>
                    <p className="text-sm text-charcoal/70">
                      {entry.organization}
                      {entry.division ? ` · ${entry.division}` : ""}
                    </p>

                    {entry.description && (
                      <p className="mt-3 text-charcoal/80 leading-relaxed max-w-2xl">
                        {entry.description}
                      </p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6 mt-4">
                      {Array.isArray(entry.responsibilities) && entry.responsibilities.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-navy/50">Responsibilities</p>
                          <ul className="mt-2 space-y-1 text-sm text-charcoal/75">
                            {entry.responsibilities.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(entry.key_contributions) && entry.key_contributions.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-navy/50">Key Contributions</p>
                          <ul className="mt-2 space-y-1 text-sm text-charcoal/75">
                            {entry.key_contributions.map((c: string, i: number) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
