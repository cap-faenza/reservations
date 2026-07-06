import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isSafeUploadName(name: string): boolean {
  return /^[a-f0-9-]+\.(jpg|png|webp)$/.test(name);
}

export function uploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

export async function saveHeroImage(
  file: File
): Promise<{ filename: string; error?: never } | { filename?: never; error: string }> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) return { error: "Formato immagine non supportato: usa JPG, PNG o WebP." };
  if (file.size > MAX_SIZE_BYTES) return { error: "L'immagine supera i 5 MB." };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(uploadPath(filename), Buffer.from(await file.arrayBuffer()));
  return { filename };
}

export async function deleteHeroImage(filename: string | null): Promise<void> {
  if (!filename || !isSafeUploadName(filename)) return;
  try {
    await unlink(uploadPath(filename));
  } catch {
    // il file potrebbe non esistere più: non è un errore
  }
}
