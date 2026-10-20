"use client";
import { useGallery } from "@/lib/supabase/hooks";
import SectionHeading from "./SectionHeading";

export default function GalleryGrid() {
  const { data: gallery } = useGallery() as { data: { id: string; original_name: string }[] };

  if (!gallery.length) return null; // nothing approved for public display yet — no placeholder noise

  return (
    <section id="gallery" className="section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto">
        <SectionHeading title="Gallery" intro="Moments from events, team activities, and field visits." />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10">
          {gallery.map((g) => (
            <div key={g.id} className="aspect-[4/3] bg-charcoal/5 border border-navy/10 overflow-hidden relative">
              <img
                src={`/api/public-image/${g.id}`}
                alt={g.original_name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
