// Pure admin check. Role lives in app_metadata, which users cannot edit themselves
// (only the service role can), unlike user_metadata.
export class AuthError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN") { super(code); this.code = code; }
}
export interface AuthUser { id: string; email?: string; app_metadata?: Record<string, unknown> }
export function assertAdmin(user: AuthUser | null | undefined): { id: string; email?: string } {
  if (!user) throw new AuthError("UNAUTHENTICATED");
  if (user.app_metadata?.role !== "admin") throw new AuthError("FORBIDDEN");
  return { id: user.id, email: user.email };
}
