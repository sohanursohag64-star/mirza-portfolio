import FileLibrary from "@/components/admin/FileLibrary";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-[var(--navy)]">Documents</h1>
      <FileLibrary kind="documents" />
    </div>
  );
}
