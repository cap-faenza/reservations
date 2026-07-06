import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 12;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET non impostato: obbligatorio in produzione.");
  }
  return secret ?? "dev-secret-non-usare-in-produzione";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPin(pin: string): boolean {
  const expected = process.env.ADMIN_PIN ?? "2026";
  // Confronto a lunghezza costante per non rivelare la lunghezza del PIN
  return safeEqual(pin.padEnd(64, " ").slice(0, 64), expected.padEnd(64, " ").slice(0, 64));
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_HOURS * 3600_000;
  const value = `${expiresAt}.${sign(String(expiresAt))}`;
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [expiresAt, signature] = raw.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;
  return Number(expiresAt) > Date.now();
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** Da chiamare all'inizio di ogni server action o pagina riservata all'admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
}
