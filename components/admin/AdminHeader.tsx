"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { adminNav } from "@/lib/admin/nav";
import { signOut } from "@/app/admin/login/actions";

type User = { id: string; email?: string } | null;

export default function AdminHeader({ onMenu, user }: { onMenu: () => void; user: User }) {
  const pathname = usePathname();
  const current = adminNav.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)));
  const initial = (user?.email?.[0] ?? "?").toUpperCase();
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-navy/10 px-4 sm:px-8 flex items-center gap-4">
      <button onClick={onMenu} aria-label="Open menu" className="lg:hidden p-2 -ml-2 text-navy"><Menu className="w-5 h-5" /></button>
      <p className="font-medium text-navy">{current?.label ?? "Admin"}</p>
      <div className="ml-auto flex items-center gap-4">
        <Link href="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-navy/70 hover:text-gold">
          View website <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-navy/10 text-navy text-xs flex items-center justify-center">{initial}</span>
          <span className="hidden md:inline text-xs text-charcoal/70" title={user?.email}>{user?.email ?? "Not signed in"}</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-navy/70 hover:text-red-600" title="Sign out">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
