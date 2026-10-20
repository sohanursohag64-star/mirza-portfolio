// Pure validation helpers (no I/O) so they can be unit-tested.
export type FileKind = "profile" | "gallery" | "documents" | "achievements" | "team";

export const BUCKETS: Record<FileKind, string> = {
  profile: "private-profile",
  gallery: "private-gallery",
  documents: "private-documents",
  achievements: "private-achievements",
  team: "private-team",
};

const IMG: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const DOC: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
};
const MB = 1024 * 1024;

export const RULES: Record<FileKind, { types: Record<string, string[]>; maxBytes: number }> = {
  profile: { types: IMG, maxBytes: 10 * MB },
  gallery: { types: IMG, maxBytes: 15 * MB },
  documents: { types: DOC, maxBytes: 25 * MB },
  achievements: { types: { ...IMG, ...DOC }, maxBytes: 25 * MB },
  team: { types: IMG, maxBytes: 10 * MB },
};
export const isImageMime = (m: string) => m in IMG;

export function sanitizeFilename(name: string): string {
  const base = (name || "file").split(/[\\/]/).pop() || "file";
  const clean = base.replace(/[\u0000-\u001f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 100);
  return clean || "file";
}

const latin = (b: Uint8Array, from: number, to: number) => Buffer.from(b.subarray(from, to)).toString("latin1");

// Detect the real type from content, ignoring the client-supplied name/MIME.
export function detectMime(b: Uint8Array): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (latin(b, 0, 8) === "\x89PNG\r\n\x1a\n") return "image/png";
  if (latin(b, 0, 4) === "RIFF" && latin(b, 8, 12) === "WEBP") return "image/webp";
  if (latin(b, 0, 1024).includes("%PDF-")) return "application/pdf";
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
    const s = latin(b, 0, b.length); // zip entry names are stored in plain text
    if (s.includes("word/")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (s.includes("ppt/")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  return null;
}

export type Validation =
  | { ok: true; mime: string; ext: string; safeName: string }
  | { ok: false; error: string };

export function validateUpload(kind: FileKind, f: { name: string; type?: string; bytes: Uint8Array }): Validation {
  const rule = RULES[kind];
  if (!f.bytes.length) return { ok: false, error: "File is empty" };
  if (f.bytes.length > rule.maxBytes) return { ok: false, error: `File exceeds ${rule.maxBytes / MB} MB limit` };
  const safeName = sanitizeFilename(f.name);
  const ext = (safeName.match(/\.[A-Za-z0-9]+$/)?.[0] || "").toLowerCase();
  const detected = detectMime(f.bytes);
  if (!detected || !rule.types[detected]) return { ok: false, error: "Unsupported or unrecognised file content" };
  if (!rule.types[detected].includes(ext)) return { ok: false, error: "File extension does not match file content" };
  if (f.type && f.type !== "application/octet-stream" && f.type !== detected)
    return { ok: false, error: "Declared MIME type does not match file content" };
  return { ok: true, mime: detected, ext: rule.types[detected][0], safeName };
}
