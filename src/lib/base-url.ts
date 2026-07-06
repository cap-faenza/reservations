import { headers } from "next/headers";

/** URL pubblico dell'app, da BASE_URL oppure dedotto dagli header della richiesta. */
export async function getBaseUrl(): Promise<string> {
  const fromEnv = process.env.BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
