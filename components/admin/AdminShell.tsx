"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "./ToastNotification";
import { AdminDataProvider } from "./AdminDataProvider";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({ children, user }: { children: ReactNode; user: { id: string; email?: string } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <ToastProvider>
      <AdminDataProvider>
        <div className="min-h-screen bg-white text-ink lg:pl-64">
          <AdminSidebar open={open} onClose={() => setOpen(false)} />
          <AdminHeader onMenu={() => setOpen(true)} user={user} />
          <main className="px-4 sm:px-8 py-8 max-w-6xl">{children}</main>
        </div>
      </AdminDataProvider>
    </ToastProvider>
  );
}
