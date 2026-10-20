import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-offwhite/60 section-pad py-8">
      <div className="max-w-content mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <p>{profile.company} · {profile.division}</p>
      </div>
    </footer>
  );
}
