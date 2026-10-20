"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FileLibrary from "./FileLibrary";
import { useToast } from "./ToastNotification";
import { isSessionError } from "@/lib/admin/session";
import { updateProfile } from "@/app/admin/actions";

// Wraps the generic FileLibrary (kind="profile") and links whichever file the admin uploads
// or replaces to profiles.photo_file_id — that column is what the public Hero section reads.
export default function ProfilePhotoManager({ currentPhotoId }: { currentPhotoId: string | null }) {
  const [linkedId, setLinkedId] = useState(currentPhotoId);
  const { notify } = useToast();
  const router = useRouter();

  async function link(file: { id: string }) {
    try {
      await updateProfile({ photo_file_id: file.id });
      setLinkedId(file.id);
      notify("success", "Profile photo updated on the public website.");
    } catch (err) {
      if (isSessionError(err)) { router.push("/admin/login?expired=1"); return; }
      notify("error", "Photo uploaded, but could not set it as the public profile photo. Try again.");
    }
  }

  return (
    <div className="space-y-3">
      {linkedId && (
        <div className="flex items-center gap-3">
          <img src={`/api/public-image/${linkedId}`} alt="Current public profile photo" className="w-16 h-16 rounded-full object-cover border border-navy/15"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <p className="text-xs text-charcoal/60">Currently shown on the public website. Upload a new image and mark it public to replace it.</p>
        </div>
      )}
      <FileLibrary kind="profile" onUploaded={link} />
    </div>
  );
}
