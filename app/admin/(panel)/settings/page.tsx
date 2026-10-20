import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { signOut } from "@/app/admin/login/actions";
import MaintenancePanel from "@/components/admin/MaintenancePanel";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Settings</h1>
      <p className="mt-1 text-sm text-charcoal/65 max-w-xl">Account and session information.</p>

      <div className="mt-8 space-y-8 max-w-3xl">
        <section className="border border-navy/10 p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Account</h2>
          <p className="mt-2 text-sm text-charcoal/65">Signed in as <span className="text-navy font-medium">{user?.email ?? "unknown"}</span>.</p>
        </section>
        <section className="border border-navy/10 p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Content</h2>
          <p className="mt-2 text-sm text-charcoal/65">Edit public profile details in <Link href="/admin/profile" className="text-gold underline underline-offset-4">Profile</Link>, and contact details in <Link href="/admin/contact" className="text-gold underline underline-offset-4">Contact</Link>.</p>
        </section>
        <section className="border border-navy/10 p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Security</h2>
          <p className="mt-2 text-sm text-charcoal/65">Password changes and admin account management aren't built into this panel yet. Manage accounts directly in the Supabase Dashboard under Authentication → Users, and set the admin role as described in <code className="text-xs">lib/supabase/rls.sql</code>.</p>
        </section>
        <section className="border border-navy/10 p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Maintenance</h2>
          <p className="mt-2 text-sm text-charcoal/65">A failed file deletion is queued and retried here rather than left as a stray file in storage.</p>
          <MaintenancePanel />
        </section>
        <section className="border border-navy/10 p-5 sm:p-6">
          <h2 className="font-display text-lg text-navy">Session</h2>
          <p className="mt-2 text-sm text-charcoal/65">Signing out ends your session on this device immediately.</p>
          <form action={signOut}>
            <button type="submit" className="mt-4 inline-block px-5 py-2.5 text-sm border border-navy/20 text-navy hover:border-gold">Sign out</button>
          </form>
        </section>
      </div>
    </div>
  );
}
