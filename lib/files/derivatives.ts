// Server-only. Re-encodes to WebP: strips EXIF/GPS metadata, caps dimensions.
export async function makeDerivatives(bytes: Uint8Array) {
  const sharp = (await import("sharp")).default;
  const src = sharp(Buffer.from(bytes), { limitInputPixels: 60_000_000 }).rotate();
  const display = await src.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const thumb = await src.clone().resize({ width: 400, height: 400, fit: "cover" }).webp({ quality: 70 }).toBuffer();
  return { display: new Uint8Array(display), thumb: new Uint8Array(thumb) };
}
