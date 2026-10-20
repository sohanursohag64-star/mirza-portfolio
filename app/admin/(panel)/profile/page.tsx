import SectionForm from "@/components/admin/SectionForm";
import ProfilePhotoManager from "@/components/admin/ProfilePhotoManager";
import { updateProfile } from "@/app/admin/actions";
import { loadProfile } from "@/lib/supabase/public";
import { profile as confirmedFacts } from "@/lib/data";

export default async function AdminProfilePage() {
  const row: any = (await loadProfile()) ?? {};
  // Confirmed facts fill the gaps only when no row exists yet (first run); once a real row
  // exists, its values are the source of truth, even if someone clears a field back to "".
  const hasRow = Object.keys(row).length > 0 && "id" in row;
  const initial = {
    name: row.name ?? confirmedFacts.name,
    designation: row.designation ?? confirmedFacts.role,
    company: row.company ?? confirmedFacts.company,
    division: row.division ?? confirmedFacts.division,
    experience: row.experience ?? "",
    previous_company: row.previous_company ?? confirmedFacts.previousOrganization,
    bio: row.bio ?? "",
    leadership_statement: row.leadership_statement ?? "",
  };

  return (
    <div>
      <SectionForm title="Profile" description="Public profile details shown across the website." initial={initial} onSave={updateProfile}
        sections={[
          { title: "Basic Information", fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "designation", label: "Designation", type: "text", required: true },
            { name: "company", label: "Company", type: "text" },
            { name: "division", label: "Division", type: "text" },
            { name: "experience", label: "Experience", type: "text", placeholder: "e.g. 7+ years" },
            { name: "previous_company", label: "Previous Organization", type: "text" },
          ] },
          { title: "Professional Profile", fields: [
            { name: "bio", label: "Biography", type: "textarea", wide: true, placeholder: "Write a short professional biography" },
            { name: "leadership_statement", label: "Leadership Statement", type: "textarea", wide: true, placeholder: "How you lead teams and drive performance" },
          ] },
        ]} />
      <div className="mt-8 max-w-3xl border border-navy/10 p-5 sm:p-6">
        <h2 className="font-display text-lg text-navy">Profile Photo</h2>
        <p className="mt-1 mb-4 text-sm text-charcoal/60">Shown in the hero section of the public website.</p>
        <ProfilePhotoManager currentPhotoId={hasRow ? row.photo_file_id ?? null : null} />
      </div>
      <p className="mt-6 max-w-3xl text-sm text-charcoal/60">
        Email, phone, LinkedIn and location are managed on the <a href="/admin/contact" className="text-gold underline underline-offset-4">Contact</a> page.
      </p>
    </div>
  );
}
