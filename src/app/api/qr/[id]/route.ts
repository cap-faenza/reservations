import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { qrDarkColor } from "@/lib/color";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const baseUrl = await getBaseUrl();
  const png = await QRCode.toBuffer(`${baseUrl}/serata/${event.id}`, {
    type: "png",
    width: 1024,
    margin: 2,
    color: { dark: qrDarkColor(event.themeColor), light: "#ffffff" },
  });

  const slug =
    event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "serata";

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${slug}.png"`,
    },
  });
}
