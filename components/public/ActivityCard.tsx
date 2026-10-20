"use client";
import { useActivities } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";
import { Calendar, MapPin, Tag } from "lucide-react";

export function ActivityCard({ activity }: { activity: any }) {
  return (
    <div className="border border-navy/10 bg-paper p-6 flex flex-col gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-gold-line w-fit">
        <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
        {activity.category}
      </span>
      <p className="text-navy font-medium">{activity.title}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/50">
        {activity.date && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            {activity.date}
          </span>
        )}
        {activity.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
            {activity.location}
          </span>
        )}
      </div>
      <p className="text-sm text-charcoal/70 leading-relaxed">{activity.description}</p>
    </div>
  );
}

const categories = [
  "Team Meetings",
  "Training Programs",
  "Sales Conferences",
  "CME / Professional Events",
  "Field Coaching",
  "Strategic Meetings",
  "Team Development",
  "Corporate Events",
];

export default function ActivitiesSection() {
  const { data: activities } = useActivities() as { data: any[] };

  return (
    <section id="activities" className="bg-paper section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Leadership Activities" />

        {activities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-navy/15 p-8 text-center">
            <p className="text-charcoal/60 text-sm">
              Leadership activities will be added through the Admin Panel.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {categories.map((c) => (
                <span
                  key={c}
                  className="text-[11px] uppercase tracking-wide text-navy/40 border border-navy/10 px-2.5 py-1"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
