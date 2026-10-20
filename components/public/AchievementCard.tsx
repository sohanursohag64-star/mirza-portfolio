"use client";
import { useAchievements } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";
import { Award, FileText } from "lucide-react";

export function AchievementCard({ achievement }: { achievement: any }) {
  return (
    <div className="border border-navy/10 bg-paper flex flex-col overflow-hidden tilt-card">
      {achievement.image_file_id && (
        <img
          src={`/api/public-image/${achievement.image_file_id}`}
          alt={achievement.title}
          className="w-full h-40 object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-6 flex flex-col gap-3">
        <Award className="w-4.5 h-4.5 text-gold" strokeWidth={1.5} />
        <div className="flex items-center gap-2 text-xs text-gold-line">
          <span>{achievement.year ?? "Year — TBD"}</span>
          <span className="w-1 h-1 rounded-full bg-gold-line/60" />
          <span>{achievement.category}</span>
        </div>
        <p className="font-display text-lg text-navy leading-snug">{achievement.title}</p>
        <p className="text-sm text-charcoal/70 leading-relaxed">{achievement.description}</p>
        {achievement.performance_metric && (
          <p className="text-xs text-navy/60 font-medium">{achievement.performance_metric}</p>
        )}
        {achievement.document_file_id && (
          <span className="inline-flex items-center gap-1 text-xs text-charcoal/40 mt-1">
            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
            Supporting document on file
          </span>
        )}
      </div>
    </div>
  );
}

export default function AchievementsSection() {
  const { data: achievements } = useAchievements() as { data: any[] };

  return (
    <section id="achievements" className="section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading
          title="Achievements & Milestones"
          intro={achievements.length === 0 ? "No achievements have been added yet." : undefined}
        />

        {achievements.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-charcoal/60 text-sm">No achievements have been added yet.</p>
        )}
      </div>
    </section>
  );
}
