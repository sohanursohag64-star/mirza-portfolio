import { LayoutDashboard, User, BarChart, Briefcase, Users, Layers, MapPin, Target, Award, Calendar, Image as ImageIcon, FileText, Mail, Settings, type LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard, user: User, "bar-chart": BarChart, briefcase: Briefcase, users: Users,
  layers: Layers, "map-pin": MapPin, target: Target, award: Award, calendar: Calendar, image: ImageIcon,
  "file-text": FileText, mail: Mail, settings: Settings,
};
export default function NavIcon({ name, className }: { name: string; className?: string }) {
  const I = map[name] ?? LayoutDashboard;
  return <I className={className} strokeWidth={1.5} aria-hidden />;
}
