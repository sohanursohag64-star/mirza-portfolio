import type { Option } from "@/lib/admin/types";

export default function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="sr-only">Filter by {label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy focus:border-gold outline-none w-full sm:w-auto">
        <option value="">All {label}s</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
