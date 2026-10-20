import AdminShell from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks non-admins from reaching this layout; this is just to display who's signed in.
  const user = await getCurrentUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
