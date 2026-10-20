"use client";
import { useContact } from "@/lib/supabase/hooks";
import { contact as confirmedFacts } from "@/lib/data";

export default function ContactSection() {
  const { data: contact } = useContact() as { data: any };

  return (
    <section id="contact" className="bg-navy text-offwhite section-pad py-20 sm:py-28">
      <div className="max-w-content mx-auto grid lg:grid-cols-[1fr_1fr] gap-12">
        <div>
          <p className="text-gold-soft text-sm tracking-wide">Contact</p>
          <h2 className="font-display text-3xl sm:text-4xl mt-3 font-medium">
            {confirmedFacts.heading}
          </h2>
          <div className="hairline w-16 mt-4" />
          <dl className="mt-8 space-y-4 text-offwhite/80 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 text-offwhite/50">Email</dt>
              <dd>{contact?.email || confirmedFacts.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-offwhite/50">Phone</dt>
              <dd>{contact?.phone || confirmedFacts.phone}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-offwhite/50">Location</dt>
              <dd>{contact?.location || confirmedFacts.location}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-offwhite/50">LinkedIn</dt>
              <dd>{contact?.linkedin || confirmedFacts.linkedin}</dd>
            </div>
          </dl>
        </div>

        {/* Placeholder contact form — not wired to a backend. Honest about that below. */}
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full bg-transparent border border-offwhite/25 px-4 py-3 text-sm placeholder:text-offwhite/40 focus:border-gold outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent border border-offwhite/25 px-4 py-3 text-sm placeholder:text-offwhite/40 focus:border-gold outline-none"
          />
          <textarea
            placeholder="Message"
            rows={4}
            className="w-full bg-transparent border border-offwhite/25 px-4 py-3 text-sm placeholder:text-offwhite/40 focus:border-gold outline-none"
          />
          <button
            type="button"
            className="bg-gold text-navy px-6 py-3 text-sm font-medium hover:bg-gold-soft transition-colors"
          >
            Send Message
          </button>
          <p className="text-xs text-offwhite/40">
            Form is not yet connected — this will be wired to a backend endpoint later.
          </p>
        </form>
      </div>
    </section>
  );
}
