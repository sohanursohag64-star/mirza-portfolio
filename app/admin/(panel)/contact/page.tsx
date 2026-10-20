import SectionForm from "@/components/admin/SectionForm";
import { updateContact } from "@/app/admin/actions";
import { loadContact } from "@/lib/supabase/public";

export default async function AdminContactPage() {
  const row: any = (await loadContact()) ?? {};
  const initial = { email: row.email ?? "", phone: row.phone ?? "", linkedin: row.linkedin ?? "", location: row.location ?? "" };

  return (
    <SectionForm title="Contact" description="Contact details shown in the public Contact section." saveLabel="Save" initial={initial} onSave={updateContact}
      sections={[{ title: "Contact Details", fields: [
        { name: "email", label: "Email", type: "email", placeholder: "name@company.com" },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/…" },
        { name: "location", label: "Location", type: "text" },
      ] }]} />
  );
}
