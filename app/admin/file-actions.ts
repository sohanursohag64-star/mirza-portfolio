"use server";
// Thin wrappers. Every call is admin-checked inside the service before any DB/storage access.
import { fileService } from "@/lib/files/instance";
import type { FileKind } from "@/lib/files/validate";

async function toInput(fd: FormData) {
  const f = fd.get("file");
  if (!(f instanceof File)) throw new Error("No file provided");
  return { name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) };
}
export async function uploadFile(kind: FileKind, fd: FormData) {
  return fileService.upload(kind, await toInput(fd), { isPublic: fd.get("isPublic") === "true" });
}
export async function replaceFile(id: string, fd: FormData) { return fileService.replace(id, await toInput(fd)); }
export async function deleteFile(id: string) { return fileService.remove(id); }
export async function getDownloadUrl(id: string) { return fileService.getDownloadUrl(id); }
export async function listFiles(kind: FileKind) { return fileService.list(kind); }

export async function retryOrphanedFiles() {
  return fileService.retryOrphans();
}
