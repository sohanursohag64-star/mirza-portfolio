// Client-safe: server actions rethrow AuthError, which Next.js serializes to the browser
// as a plain Error whose message is the error code (see lib/files/guard.ts).
export function isSessionError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return m === "UNAUTHENTICATED" || m === "FORBIDDEN";
}
