"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { adminNav } from "@/lib/admin/nav";
import NavIcon from "./NavIcon";

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy-deep/60 lg:hidden" onClick={onClose} aria-hidden />}
      <aside aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-deep text-offwhite flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-offwhite/10">
          <div>
            <p className="font-display text-base leading-tight">Mirza Asif Iqbal</p>
            <p className="text-[11px] text-gold-soft">Sales Leadership Management</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="lg:hidden text-offwhite/70"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {adminNav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm border-l-2 ${active ? "border-gold bg-offwhite/10 text-offwhite" : "border-transparent text-offwhite/65 hover:text-offwhite hover:bg-offwhite/5"}`}>
                <NavIcon name={item.icon} className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-offwhite/10">
          {/* Leaves the panel only; real sign-out arrives with Supabase Auth. */}
          <Link href="/admin/login" className="flex items-center gap-3 px-3 py-2.5 text-sm text-offwhite/65 hover:text-offwhite hover:bg-offwhite/5">
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
