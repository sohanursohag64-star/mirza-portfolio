"use client";
import { useProfile, useStatistics } from "@/lib/supabase/hooks";
import { profile as confirmedFacts } from "@/lib/data";
import { Briefcase, Users, Map, Layers } from "lucide-react";

const statIcon: Record<string, any> = { briefcase: Briefcase, users: Users, map: Map, layers: Layers };

export default function Hero() {
  const { data: profile } = useProfile() as { data: any };
  const { data: stats } = useStatistics();
  const photoId = profile?.photo_file_id as string | undefined;

  return (
    <section id="home" className="relative bg-navy text-offwhite overflow-hidden">
      {/* subtle background: hairline grid + soft geometric rings, kept out of the way of content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F6F4EF 1px, transparent 1px), linear-gradient(to bottom, #F6F4EF 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full border border-gold-line/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-10 w-[220px] h-[220px] rounded-full border border-gold-line/15"
      />

      <div className="relative max-w-content mx-auto section-pad grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center py-16 sm:py-24">
        {/* LEFT: identity + CTAs */}
        <div>
          <p className="text-gold-soft text-sm tracking-wide">
            {profile?.designation ?? "Zonal Manager"} · {profile?.division ?? "Specialty Product Division"}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] mt-4 font-medium">
            {confirmedFacts.headline}
          </h1>
          <p className="mt-6 text-offwhite/75 max-w-xl leading-relaxed">
            {profile?.bio || confirmedFacts.intro}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#leadership"
              className="bg-gold text-navy px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-gold-soft transition-colors"
            >
              Explore Leadership Profile
            </a>
            <a
              href="#achievements"
              className="border border-offwhite/25 px-7 py-3.5 text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors"
            >
              View Achievements
            </a>
          </div>
        </div>

        {/* RIGHT: portrait + compact leadership stats */}
        <div className="flex flex-col items-center lg:items-end gap-8">
          {photoId ? (
            <img
              src={`/api/public-image/${photoId}`}
              alt={profile?.name ? `Portrait of ${profile.name}` : "Portrait"}
              className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-gold-line/50 object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              loading="eager"
            />
          ) : (
            <div role="img" aria-label="Portrait placeholder" className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-gold-line/50 flex items-center justify-center text-offwhite/40 text-xs text-center px-6 bg-navy-light/40">
              Portrait placeholder
              <br />— replace with photo —
            </div>
          )}
          <div className="text-center lg:text-right">
            <p className="font-display text-xl">{profile?.name ?? "Mirza Asif Iqbal"}</p>
            <p className="text-offwhite/55 text-sm">{profile?.company ?? "Radiant Pharmaceuticals Ltd."}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {stats.slice(0, 4).map((s: any) => {
              const Icon = statIcon[s.icon] ?? Layers;
              return (
                <div
                  key={s.title}
                  className="border border-offwhite/12 bg-offwhite/[0.03] px-4 py-3.5 flex items-center gap-3"
                >
                  <Icon className="w-4 h-4 text-gold shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-display text-lg leading-none">{s.value}</p>
                    <p className="text-[11px] text-offwhite/55 mt-1">{s.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
