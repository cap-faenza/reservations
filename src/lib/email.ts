import "server-only";
import nodemailer from "nodemailer";
import { SITE_NAME } from "./config";
import { formatDateLong } from "./format";
import { contrastText } from "./color";

type ReservationEmailParams = {
  to: string;
  kind: "created" | "updated";
  firstName: string;
  people: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  themeColor: string;
  manageUrl: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

/**
 * Invia l'email con il link di gestione della prenotazione.
 * Non blocca mai la prenotazione: in caso di errore o SMTP non configurato
 * logga e prosegue.
 */
export async function sendReservationEmail(params: ReservationEmailParams): Promise<boolean> {
  const { to, kind, firstName, people, eventName, eventDate, eventTime, themeColor, manageUrl } =
    params;

  const subject =
    kind === "created"
      ? `Prenotazione confermata — ${eventName}`
      : `Prenotazione aggiornata — ${eventName}`;

  const intro =
    kind === "created"
      ? `la tua prenotazione per <strong>${escapeHtml(eventName)}</strong> è confermata!`
      : `la tua prenotazione per <strong>${escapeHtml(eventName)}</strong> è stata aggiornata.`;

  const text = [
    `Ciao ${firstName},`,
    kind === "created"
      ? `la tua prenotazione per "${eventName}" è confermata!`
      : `la tua prenotazione per "${eventName}" è stata aggiornata.`,
    ``,
    `Quando: ${formatDateLong(eventDate)}, ore ${eventTime}`,
    `Persone: ${people}`,
    ``,
    `Per modificare o cancellare la prenotazione usa questo link:`,
    manageUrl,
    ``,
    `A presto!`,
    SITE_NAME,
  ].join("\n");

  const html = `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1c1917;">
    <h1 style="font-size: 22px; margin: 0 0 4px; color: ${themeColor};">${escapeHtml(eventName)}</h1>
    <p style="margin: 0 0 20px; color: #78716c; font-size: 14px;">${SITE_NAME}</p>
    <p>Ciao ${escapeHtml(firstName)},<br/>${intro}</p>
    <table style="border-collapse: collapse; margin: 16px 0; font-size: 15px;">
      <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">Quando</td><td style="padding: 4px 0;"><strong>${formatDateLong(eventDate)}, ore ${eventTime}</strong></td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">Persone</td><td style="padding: 4px 0;"><strong>${people}</strong></td></tr>
    </table>
    <p style="margin: 24px 0;">
      <a href="${manageUrl}" style="background: ${themeColor}; color: ${contrastText(themeColor)}; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">
        Gestisci la prenotazione
      </a>
    </p>
    <p style="font-size: 13px; color: #78716c;">
      Con questo link puoi modificare o cancellare la tua prenotazione in qualsiasi momento.
      Conserva questa email: il link è personale.
    </p>
  </div>`;

  const transport = getTransport();
  if (!transport) {
    console.log(`[email non configurata] Link di gestione per ${to}: ${manageUrl}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? `${SITE_NAME} <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Invio email a ${to} fallito:`, error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
