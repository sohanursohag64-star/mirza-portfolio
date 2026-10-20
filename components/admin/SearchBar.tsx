import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">Search</span>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-navy/15 pl-9 pr-3 py-2.5 text-sm placeholder:text-navy/35 focus:border-gold outline-none" />
    </label>
  );
}
