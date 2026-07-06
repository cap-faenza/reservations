import { readFile } from "fs/promises";
import { isSafeUploadName, uploadPath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!isSafeUploadName(file)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const buffer = await readFile(uploadPath(file));
    const ext = file.split(".").pop() ?? "";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
