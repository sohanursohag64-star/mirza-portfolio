import { test } from "node:test";
import assert from "node:assert/strict";
import { createFileService } from "../lib/files/service.ts";
import { assertAdmin, AuthError } from "../lib/files/guard.ts";
import { detectMime, sanitizeFilename } from "../lib/files/validate.ts";

// ---------- in-memory fake of the supabase-js calls the service uses ----------
function fakeClient() {
  const buckets: Record<string, Map<string, Uint8Array>> = {};
  const tables: Record<string, any[]> = {};
  const fail = { remove: false, update: false, upload: 0 };
  const b = (n: string) => (buckets[n] ??= new Map());
  const t = (n: string) => (tables[n] ??= []);
  const q = (name: string) => {
    let rows = t(name), op: any = null, patch: any = null;
    const run = () => {
      if (op === "delete") { tables[name] = t(name).filter((r) => !rows.includes(r)); return { error: null }; }
      if (op === "update") { if (fail.update) return { error: { message: "db down" } }; rows.forEach((r) => Object.assign(r, patch)); return { error: null }; }
      return { error: null };
    };
    const api: any = {
      insert: (r: any) => { (Array.isArray(r) ? r : [r]).forEach((x) => t(name).push({ ...x })); return Promise.resolve({ error: null }); },
      select: () => api, eq: (k: string, v: any) => { rows = rows.filter((r) => r[k] === v); return api; },
      maybeSingle: () => Promise.resolve({ data: rows[0] ? structuredClone(rows[0]) : null, error: null }),
      update: (p: any) => { op = "update"; patch = p; return api; }, delete: () => { op = "delete"; return api; },
      then: (res: any, rej: any) => Promise.resolve(op ? run() : { data: rows, error: null }).then(res, rej),
    };
    return api;
  };
  const client = {
    from: q,
    storage: { from: (bn: string) => ({
      upload: async (p: string, body: Uint8Array) => { if (fail.upload && b(bn).size >= fail.upload) return { error: { message: "quota" } }; b(bn).set(p, body); return { error: null }; },
      remove: async (ps: string[]) => { if (fail.remove) return { error: { message: "storage down" } }; ps.forEach((p) => b(bn).delete(p)); return { error: null }; },
      createSignedUrl: async (p: string, ttl: number, o: any) => b(bn).has(p) ? { data: { signedUrl: `https://x/sign?p=${p}&ttl=${ttl}&dl=${o?.download}` }, error: null } : { data: null, error: { message: "Object not found" } },
      download: async (p: string) => b(bn).has(p) ? { data: { arrayBuffer: async () => b(bn).get(p)!.buffer }, error: null } : { data: null, error: { message: "nf" } },
    }) },
  };
  return { client, buckets, tables, fail, count: () => Object.values(buckets).reduce((n, m) => n + m.size, 0) };
}

// ---------- fixtures: real magic bytes ----------
const pad = (a: number[], n = 64) => Uint8Array.from([...a, ...Array(Math.max(0, n - a.length)).fill(0)]);
const JPG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PDF = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n");
const DOCX = new TextEncoder().encode("PK\x03\x04....word/document.xml....");
const EXE = pad([0x4d, 0x5a, 0x90, 0x00]);

const derive = async (b: Uint8Array) => ({ display: new TextEncoder().encode("DISPLAY"), thumb: new TextEncoder().encode("THUMB") });
const ADMIN = { id: "admin-1", email: "a@x.com", app_metadata: { role: "admin" } };
function svc(user: any) {
  const f = fakeClient(); let n = 0;
  const s = createFileService({ client: f.client, requireAdmin: async () => assertAdmin(user), makeDerivatives: derive,
    uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}` });
  return { s, ...f };
}
const uploadAsAdmin = async (kind: any = "documents", file = { name: "Report.pdf", type: "application/pdf", bytes: PDF }, pub = false) => {
  const c = svc(ADMIN); const r = await c.s.upload(kind, file, { isPublic: pub }); return { ...c, r };
};

// ================= LEVEL 1: ANONYMOUS =================
test("anonymous: every admin operation is rejected and touches nothing", async () => {
  const seed = await uploadAsAdmin();
  const anon = createFileService({ client: seed.client, requireAdmin: async () => assertAdmin(null), makeDerivatives: derive });
  const before = seed.count();
  await assert.rejects(anon.upload("documents", { name: "a.pdf", bytes: PDF }), (e: any) => e.code === "UNAUTHENTICATED");
  await assert.rejects(anon.getDownloadUrl(seed.r.id), (e: any) => e.code === "UNAUTHENTICATED");
  await assert.rejects(anon.replace(seed.r.id, { name: "a.pdf", bytes: PDF }), (e: any) => e.code === "UNAUTHENTICATED");
  await assert.rejects(anon.remove(seed.r.id), (e: any) => e.code === "UNAUTHENTICATED");
  await assert.rejects(anon.list("documents"), (e: any) => e.code === "UNAUTHENTICATED");
  assert.equal(seed.count(), before); assert.equal(seed.tables.stored_files.length, 1);
  assert.ok(seed.tables.file_audit_logs.some((l) => l.status === "UNAUTHENTICATED"), "denials are audited");
});
test("anonymous: public endpoint never serves documents, private rows, or originals", async () => {
  const doc = await uploadAsAdmin("documents", undefined, true);           // documents can't be public
  assert.equal(await doc.s.publicAsset(doc.r.id), null);
  const priv = await uploadAsAdmin("gallery", { name: "p.jpg", type: "image/jpeg", bytes: JPG }, false);
  assert.equal(await priv.s.publicAsset(priv.r.id), null);                  // not approved
  assert.equal(await priv.s.publicAsset("../../etc/passwd"), null);         // malformed id
  const pub = await uploadAsAdmin("gallery", { name: "p.jpg", type: "image/jpeg", bytes: JPG }, true);
  const a = await pub.s.publicAsset(pub.r.id);
  assert.equal(new TextDecoder().decode(a!.bytes), "DISPLAY");              // derivative, not JPG original
  assert.equal(a!.contentType, "image/webp");
});

// ================= LEVEL 2: NON-ADMIN AUTHENTICATED =================
test("non-admin user: FORBIDDEN everywhere, including spoofed user_metadata role", async () => {
  const seed = await uploadAsAdmin();
  for (const u of [{ id: "u2", app_metadata: {} }, { id: "u3", app_metadata: { role: "editor" } }, { id: "u4", app_metadata: {}, user_metadata: { role: "admin" } } as any]) {
    const s = createFileService({ client: seed.client, requireAdmin: async () => assertAdmin(u), makeDerivatives: derive });
    await assert.rejects(s.getDownloadUrl(seed.r.id), (e: any) => e instanceof AuthError && e.code === "FORBIDDEN");
    await assert.rejects(s.remove(seed.r.id), (e: any) => e.code === "FORBIDDEN");
    await assert.rejects(s.upload("documents", { name: "a.pdf", bytes: PDF }), (e: any) => e.code === "FORBIDDEN");
  }
  assert.equal(seed.tables.stored_files.length, 1);
});

// ================= LEVEL 3: ADMIN =================
test("admin: upload stores UUID path, sanitized name, originals only in private bucket", async () => {
  const { r, buckets, tables } = await uploadAsAdmin("documents", { name: "../../My Secret Report!!.pdf", type: "application/pdf", bytes: PDF });
  const row = tables.stored_files[0];
  assert.equal(row.original_path, `${r.id}/original.pdf`);
  assert.equal(row.original_name, "My_Secret_Report_.pdf");
  assert.ok(buckets["private-documents"].has(row.original_path));
  assert.equal(row.public_path, null);
  assert.equal(tables.file_audit_logs.at(-1).action, "FILE_UPLOAD");
  assert.equal(tables.file_audit_logs.at(-1).admin_id, "admin-1");
});
test("admin: image upload creates derivatives; download gives 60s signed URL for original", async () => {
  const { s, r, buckets, tables } = await uploadAsAdmin("gallery", { name: "Team.JPG", type: "image/jpeg", bytes: JPG });
  assert.equal(buckets["private-gallery"].size, 3);
  const d = await s.getDownloadUrl(r.id);
  assert.equal(d.expiresIn, 60); assert.match(d.url, /ttl=60/); assert.match(d.url, /original\.jpg/);
  assert.equal(tables.file_audit_logs.at(-1).action, "FILE_DOWNLOAD");
});
test("admin: download of a file missing from storage fails cleanly", async () => {
  const { s, r, buckets } = await uploadAsAdmin(); buckets["private-documents"].clear();
  await assert.rejects(s.getDownloadUrl(r.id), /missing/);
});
test("admin: replace removes old objects only after DB update succeeds", async () => {
  const { s, r, buckets, tables } = await uploadAsAdmin("gallery", { name: "a.jpg", type: "image/jpeg", bytes: JPG });
  const old = tables.stored_files[0].original_path;
  await s.replace(r.id, { name: "b.png", type: "image/png", bytes: PNG });
  assert.ok(!buckets["private-gallery"].has(old)); assert.equal(buckets["private-gallery"].size, 3);
  assert.match(tables.stored_files[0].original_path, /original\.png$/);
  assert.equal(tables.file_audit_logs.at(-1).action, "FILE_REPLACE");
});
test("admin: replace with failing DB keeps old file and cleans up new upload", async () => {
  const c = await uploadAsAdmin(); const oldPath = c.tables.stored_files[0].original_path; c.fail.update = true;
  await assert.rejects(c.s.replace(c.r.id, { name: "n.pdf", type: "application/pdf", bytes: PDF }));
  assert.deepEqual([...c.buckets["private-documents"].keys()], [oldPath]);
});
test("admin: delete removes row + original + derivatives; storage failure is queued, not lost", async () => {
  const a = await uploadAsAdmin("gallery", { name: "a.jpg", type: "image/jpeg", bytes: JPG });
  await a.s.remove(a.r.id);
  assert.equal(a.tables.stored_files.length, 0); assert.equal(a.count(), 0);
  const b = await uploadAsAdmin("gallery", { name: "a.jpg", type: "image/jpeg", bytes: JPG }); b.fail.remove = true;
  await b.s.remove(b.r.id);
  assert.equal(b.tables.orphaned_files.length, 3);
});
test("admin: retryOrphans clears what it can and leaves the rest queued", async () => {
  const c = await uploadAsAdmin("gallery", { name: "a.jpg", type: "image/jpeg", bytes: JPG }); c.fail.remove = true;
  await c.s.remove(c.r.id);
  assert.equal(c.tables.orphaned_files.length, 3);
  c.fail.remove = false;
  const result = await c.s.retryOrphans();
  assert.deepEqual(result, { cleaned: 3, remaining: 0 });
  assert.equal(c.tables.orphaned_files.length, 0);
});
test("admin: partial upload failure leaves no orphans", async () => {
  const c = svc(ADMIN); c.fail.upload = 1; // original ok, derivative fails
  await assert.rejects(c.s.upload("gallery", { name: "a.jpg", type: "image/jpeg", bytes: JPG }));
  assert.equal(c.count(), 0); assert.equal((c.tables.stored_files ?? []).length, 0);
});

// ================= VALIDATION =================
test("validation rejects spoofed / oversized / unsupported files", async () => {
  const c = svc(ADMIN);
  const bad: [string, any][] = [
    ["exe renamed .pdf", { name: "x.pdf", type: "application/pdf", bytes: EXE }],
    ["png renamed .pdf", { name: "x.pdf", type: "application/pdf", bytes: PNG }],
    ["pdf with .exe ext", { name: "x.exe", type: "application/pdf", bytes: PDF }],
    ["lying MIME", { name: "x.pdf", type: "image/png", bytes: PDF }],
    ["empty", { name: "x.pdf", bytes: new Uint8Array() }],
    ["oversize doc", { name: "x.pdf", type: "application/pdf", bytes: new Uint8Array(26 * 1024 * 1024).fill(0x25) }],
  ];
  for (const [label, f] of bad) await assert.rejects(c.s.upload("documents", f), undefined as any, label);
  await assert.rejects(c.s.upload("gallery", { name: "x.pdf", type: "application/pdf", bytes: PDF }), /Unsupported/); // pdf in image bucket
  assert.equal(c.count(), 0);
});
test("helpers", () => {
  assert.equal(detectMime(DOCX), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(sanitizeFilename("..\\..\\a b/c<>.pdf"), "c_.pdf");
});
