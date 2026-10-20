"use client";
import Link from "next/link";
import { Award, Briefcase, Calendar, FileText, Image as ImageIcon, Layers, MapPin, Plus, Upload, Users } from "lucide-react";
import { leadershipScale, stats } from "@/lib/data";
import { useAdminData } from "./AdminDataProvider";
import DashboardCard from "./DashboardCard";

// Confirmed headline figures come from lib/data.ts (later: the statistics
// table). Totals count live rows from the data layer.
const metric = (label: string) => leadershipScale.metrics.find((m) => m.label === label)?.value ?? "—";
const years = stats.find((s) => s.label === "Years Experience")?.value ?? "—";

const recent = [
  { action: "Profile Updated", type: "Profile" },
  { action: "Achievement Added", type: "Achievement" },
  { action: "Image Uploaded", type: "Gallery" },
];

export default function DashboardOverview() {
  const store = useAdminData();
  const total = (k: string) => store.rows(k).length;
  const icon = "w-5 h-5";
  const quick = [
    { label: "Add Team Member", href: "/admin/team?new=1", icon: <Plus className="w-4 h-4" /> },
    { label: "Add Achievement", href: "/admin/achievements?new=1", icon: <Plus className="w-4 h-4" /> },
    { label: "Add Activity", href: "/admin/activities?new=1", icon: <Plus className="w-4 h-4" /> },
    { label: "Upload Image", href: "/admin/gallery?new=1", icon: <Upload className="w-4 h-4" /> },
    { label: "Upload Document", href: "/admin/documents?new=1", icon: <Upload className="w-4 h-4" /> },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-charcoal/65">Manage every section of the leadership website from one place.</p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard label="Team Members" value={metric("Team Members")} icon={<Users className={icon} strokeWidth={1.5} />} href="/admin/team" note="Confirmed figure" />
        <DashboardCard label="Territories" value={metric("Territories")} icon={<MapPin className={icon} strokeWidth={1.5} />} href="/admin/territories" note="Confirmed figure" />
        <DashboardCard label="Regions" value={metric("Regions")} icon={<Layers className={icon} strokeWidth={1.5} />} href="/admin/regions" note="Confirmed figure" />
        <DashboardCard label="Experience" value={`${years.replace("+", "")} Years`} icon={<Briefcase className={icon} strokeWidth={1.5} />} href="/admin/profile" note="Confirmed figure" />
        <DashboardCard label="Total Achievements" value={total("achievements")} icon={<Award className={icon} strokeWidth={1.5} />} href="/admin/achievements" />
        <DashboardCard label="Total Activities" value={total("activities")} icon={<Calendar className={icon} strokeWidth={1.5} />} href="/admin/activities" />
        <DashboardCard label="Gallery Items" value={total("gallery")} icon={<ImageIcon className={icon} strokeWidth={1.5} />} href="/admin/gallery" />
        <DashboardCard label="Documents" value={total("documents")} icon={<FileText className={icon} strokeWidth={1.5} />} href="/admin/documents" />
      </div>

      <h2 className="mt-12 font-display text-xl text-navy">Quick Actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {quick.map((q) => (
          <Link key={q.label} href={q.href} className="inline-flex items-center gap-2 border border-navy/20 px-4 py-2.5 text-sm text-navy hover:border-gold hover:text-gold">
            {q.icon} {q.label}
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl text-navy">Recent Activity</h2>
      <p className="text-xs text-charcoal/55 mt-1">Example layout only — a real audit log will be added with the database.</p>
      <div className="mt-4 overflow-x-auto border border-navy/10">
        <table className="w-full text-sm">
          <thead className="bg-offwhite text-left text-xs uppercase tracking-wide text-navy/60">
            <tr>{["Action", "Content Type", "User", "Date", "Status"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {recent.map((r) => (
              <tr key={r.action}>
                <td className="px-4 py-3 text-navy">{r.action}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3 text-navy/45">—</td>
                <td className="px-4 py-3 text-navy/45">—</td>
                <td className="px-4 py-3"><span className="px-2.5 py-0.5 text-xs border border-dashed border-gold-line text-gold">Example</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
