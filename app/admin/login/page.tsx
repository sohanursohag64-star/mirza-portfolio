import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-navy text-offwhite p-14 relative overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full border border-gold-line/20" />
        <p className="text-gold-soft text-sm tracking-wide relative">Administration</p>
        <div className="relative">
          <h1 className="font-display text-4xl leading-tight">Sales Leadership Management</h1>
          <p className="mt-4 text-offwhite/65 max-w-sm leading-relaxed">Manage profile, career, team, regions and media for the leadership website.</p>
        </div>
        <p className="text-xs text-offwhite/40 relative">Radiant Pharmaceuticals Ltd. · Specialty Product Division</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="font-display text-2xl text-navy">Mirza Asif Iqbal</p>
          <p className="text-sm text-charcoal/65 mt-1">Sales Leadership Management</p>
          <div className="hairline w-16 mt-5 mb-8" />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
