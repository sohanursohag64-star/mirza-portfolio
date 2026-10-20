"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import FormInput from "./FormInput";
import { signIn } from "@/app/admin/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-navy text-offwhite py-3 text-sm font-medium hover:bg-navy-light disabled:opacity-60">
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(signIn, undefined);
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const expired = params.get("expired") === "1";

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {expired && !state?.error && (
        <div role="status" className="flex gap-3 border border-gold-line/60 bg-offwhite px-4 py-3 text-sm text-charcoal/80">
          <Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <p>Your session has expired. Please sign in again.</p>
        </div>
      )}
      <FormInput id="email" name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <FormInput id="password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
      {state?.error && (
        <div role="alert" className="flex gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}
      <SubmitButton />
      <div className="flex items-center justify-between text-sm">
        <span className="text-navy/40">Forgot Password: ask another admin to reset it in Supabase</span>
        <Link href="/" className="text-navy/60 hover:text-gold">← Back to website</Link>
      </div>
    </form>
  );
}
