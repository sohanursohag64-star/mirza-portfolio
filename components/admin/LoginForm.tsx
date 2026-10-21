import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth"; // আপনার নিজের সেশন-চেক ফাংশন

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* বাম প্যানেল আগের মতোই */}

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="font-display text-2xl text-navy">Mirza Asif Iqbal</p>
          <h1 className="text-sm text-charcoal/65 mt-1">Sales Leadership Management</h1>
          <div className="hairline w-16 mt-5 mb-8" />
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}