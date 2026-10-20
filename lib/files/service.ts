// File service: every public method verifies admin FIRST, before touching DB or storage.
// Originals live only in private buckets. Public pages get a re-encoded derivative,
// served through a server route that checks the DB allowlist (is_public = true).
import { BUCKETS, isImageMime, validateUpload, type FileKind } from "./validate.ts";
import { AuthError } from "./guard.ts";

export const SIGNED_URL_TTL = 60; // seconds

export interface Deps {
  client: any; // supabase-js client using the service-role key (server only)
  requireAdmin: () => Promise<{ id: string; email?: string }>;
  makeDerivatives: (bytes: Uint8Array) => Promise<{ display: Uint8Array; thumb: Uint8Array }>;
  uuid?: () => string;
}
export interface FileInput { name: string; type?: string; bytes: Uint8Array }
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createFileService(d: Deps) {
  const uuid = d.uuid ?? (() => crypto.randomUUID());
  const sb = d.client;

  async function audit(adminId: string | null, action: string, fileType: string, fileId: string | null, status: string, err?: string) {
    try {
      await sb.from("file_audit_logs").insert({ admin_id: adminId, action, file_type: fileType, file_id: fileId, status, error_message: err ?? null });
    } catch { /* audit failure must not mask the primary result */ }
  }
  async function admin(action: string, fileType: string, fileId: string | null = null) {
    try { return await d.requireAdmin(); }
    catch (e) {
      if (e instanceof AuthError) await audit(null, action, fileType, fileId, e.code);
      throw e;
    }
  }
  async function putObjects(bucket: string, id: string, ext: string, f: FileInput, mime: string) {
    const uploaded: string[] = [];
    const put = async (path: string, body: Uint8Array, type: string) => {
      const { error } = await sb.storage.from(bucket).upload(path, body, { contentType: type, upsert: false });
      if (error) { console.error("[storage] upload failed:", error); throw new Error("Could not upload the file. Please try again."); }
      uploaded.push(path);
    };
    try {
      const paths: { original_path: string; public_path: string | null; thumbnail_path: string | null } =
        { original_path: `${id}/original${ext}`, public_path: null, thumbnail_path: null };
      await put(paths.original_path, f.bytes, mime);
      if (isImageMime(mime)) {
        const { display, thumb } = await d.makeDerivatives(f.bytes);
        paths.public_path = `${id}/public.webp`;
        paths.thumbnail_path = `${id}/thumb.webp`;
        await put(paths.public_path, display, "image/webp");
        await put(paths.thumbnail_path, thumb, "image/webp");
      }
      return { paths, uploaded };
    } catch (e) {
      if (uploaded.length) await sb.storage.from(bucket).remove(uploaded);
      throw e;
    }
  }
  // Remove objects; anything that fails is queued so it is never silently orphaned.
  async function removeObjects(bucket: string, paths: (string | null)[], fileId: string) {
    const list = paths.filter(Boolean) as string[];
    if (!list.length) return;
    const { error } = await sb.storage.from(bucket).remove(list);
    if (error) await sb.from("orphaned_files").insert(list.map((p) => ({ bucket, storage_path: p, file_id: fileId, reason: error.message })));
  }
  async function getRow(id: string) {
    if (!UUID_RE.test(id)) throw new Error("File not found");
    const { data, error } = await sb.from("stored_files").select("*").eq("id", id).maybeSingle();
    if (error || !data) throw new Error("File not found");
    return data;
  }

  return {
    async upload(kind: FileKind, f: FileInput, opts: { isPublic?: boolean } = {}) {
      const a = await admin("FILE_UPLOAD", kind);
      const v = validateUpload(kind, f);
      if (!v.ok) { await audit(a.id, "FILE_UPLOAD", kind, null, "REJECTED", v.error); throw new Error(v.error); }
      const id = uuid(), bucket = BUCKETS[kind];
      const { paths, uploaded } = await putObjects(bucket, id, v.ext, f, v.mime);
      const row = { id, kind, bucket, ...paths, original_name: v.safeName, mime_type: v.mime, file_size: f.bytes.length,
        is_public: !!opts.isPublic && !!paths.public_path, created_by: a.id };
      const { error } = await sb.from("stored_files").insert(row);
      if (error) { await sb.storage.from(bucket).remove(uploaded); await audit(a.id, "FILE_UPLOAD", kind, id, "FAILED", error.message); throw new Error("Could not save file record"); }
      await audit(a.id, "FILE_UPLOAD", kind, id, "SUCCESS");
      return { id, kind, original_name: v.safeName, mime_type: v.mime, file_size: f.bytes.length, is_public: row.is_public };
    },

    async getDownloadUrl(id: string) {
      const a = await admin("FILE_DOWNLOAD", "unknown", id);
      const row = await getRow(id);
      const { data, error } = await sb.storage.from(row.bucket).createSignedUrl(row.original_path, SIGNED_URL_TTL, { download: row.original_name });
      if (error || !data?.signedUrl) { await audit(a.id, "FILE_DOWNLOAD", row.kind, id, "FAILED", error?.message); throw new Error("File is missing in storage"); }
      await audit(a.id, "FILE_DOWNLOAD", row.kind, id, "SUCCESS");
      return { url: data.signedUrl as string, filename: row.original_name as string, expiresIn: SIGNED_URL_TTL };
    },

    async replace(id: string, f: FileInput) {
      const a = await admin("FILE_REPLACE", "unknown", id);
      const row = await getRow(id);
      const v = validateUpload(row.kind, f);
      if (!v.ok) { await audit(a.id, "FILE_REPLACE", row.kind, id, "REJECTED", v.error); throw new Error(v.error); }
      const oldPaths = [row.original_path, row.public_path, row.thumbnail_path];
      const newId = uuid();
      const { paths, uploaded } = await putObjects(row.bucket, newId, v.ext, f, v.mime);
      const patch = { ...paths, original_name: v.safeName, mime_type: v.mime, file_size: f.bytes.length,
        is_public: row.is_public && !!paths.public_path, updated_at: new Date().toISOString() };
      const { error } = await sb.from("stored_files").update(patch).eq("id", id);
      if (error) { await sb.storage.from(row.bucket).remove(uploaded); await audit(a.id, "FILE_REPLACE", row.kind, id, "FAILED", error.message); throw new Error("Could not update file record"); }
      // Old objects are removed only after the new reference is committed.
      await removeObjects(row.bucket, oldPaths, id);
      await audit(a.id, "FILE_REPLACE", row.kind, id, "SUCCESS");
      return { id, original_name: v.safeName, mime_type: v.mime, file_size: f.bytes.length };
    },

    async remove(id: string) {
      const a = await admin("FILE_DELETE", "unknown", id);
      const row = await getRow(id);
      const { error } = await sb.from("stored_files").delete().eq("id", id);
      if (error) { await audit(a.id, "FILE_DELETE", row.kind, id, "FAILED", error.message); throw new Error("Could not delete file record"); }
      await removeObjects(row.bucket, [row.original_path, row.public_path, row.thumbnail_path], id);
      await audit(a.id, "FILE_DELETE", row.kind, id, "SUCCESS");
      return { success: true };
    },

    // Admin-only listing (metadata only, never storage paths).
    async list(kind: FileKind) {
      await admin("FILE_LIST", kind);
      const { data } = await sb.from("stored_files").select("id,kind,original_name,mime_type,file_size,is_public,created_at").eq("kind", kind);
      return data ?? [];
    },

    // Retries every queued orphan (a storage delete that failed at the time). Safe to call
    // repeatedly — rows that still fail to remove are left in the queue for the next attempt.
    async retryOrphans() {
      const a = await admin("ORPHAN_CLEANUP", "system");
      const { data } = await sb.from("orphaned_files").select("*");
      let cleaned = 0;
      for (const row of data ?? []) {
        const { error } = await sb.storage.from(row.bucket).remove([row.storage_path]);
        if (!error) { await sb.from("orphaned_files").delete().eq("id", row.id); cleaned++; }
      }
      await audit(a.id, "ORPHAN_CLEANUP", "system", null, "SUCCESS", `${cleaned}/${(data ?? []).length} cleared`);
      return { cleaned, remaining: (data ?? []).length - cleaned };
    },

    // PUBLIC: no admin needed, but only serves the derivative of rows explicitly marked public.
    async publicAsset(id: string, variant: "display" | "thumb" = "display") {
      if (!UUID_RE.test(id)) return null;
      const { data: row } = await sb.from("stored_files").select("*").eq("id", id).maybeSingle();
      if (!row || !row.is_public) return null;
      const path = variant === "thumb" ? row.thumbnail_path : row.public_path;
      if (!path) return null; // documents have no derivative -> never served
      const { data, error } = await sb.storage.from(row.bucket).download(path);
      if (error || !data) return null;
      return { bytes: new Uint8Array(await data.arrayBuffer()), contentType: "image/webp" };
    },
  };
}
