import { NextResponse } from "next/server";
import { fileService } from "@/lib/files/instance";
export const runtime = "nodejs";
// Public: serves ONLY the WebP derivative of rows with is_public = true. Originals are unreachable here.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const v = new URL(req.url).searchParams.get("v") === "thumb" ? "thumb" : "display";
  const a = await fileService.publicAsset(params.id, v);
  if (!a) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(a.bytes, { headers: { "Content-Type": a.contentType, "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}
