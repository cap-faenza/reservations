"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { sendReservationEmail } from "@/lib/email";
import { isPast, isReservationDeadlinePassed } from "@/lib/format";
import { parseReservationForm, type FieldErrors } from "@/lib/validation";

export type ReservationFormState = {
  status: "idle" | "success" | "error";
  errors?: FieldErrors;
  message?: string;
  emailProvided?: boolean;
  emailSent?: boolean;
  firstName?: string;
  people?: number;
};

function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function createReservation(
  eventId: string,
  _prev: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { status: "error", message: "Serata non trovata." };
  if (
    !event.isOpen ||
    isPast(event.date) ||
    isReservationDeadlinePassed(event.bookingDeadline)
  ) {
    return { status: "error", message: "Le prenotazioni per questa serata sono chiuse." };
  }

  const { data, errors } = parseReservationForm(formData);
  if (!data) return { status: "error", errors };

  // Dedup per email nella stessa serata: se questa email ha già una prenotazione
  // per questa serata, la sovrascriviamo silenziosamente mantenendo lo stesso
  // token, così eventuali link di gestione già inviati restano validi.
  let token: string;
  const existing = data.email
    ? await db.reservation.findFirst({ where: { eventId, email: data.email } })
    : null;
  if (existing) {
    token = existing.token;
    await db.reservation.update({ where: { id: existing.id }, data });
  } else {
    token = newToken();
    await db.reservation.create({ data: { ...data, eventId, token } });
  }

  let emailSent = false;
  if (data.email) {
    const baseUrl = await getBaseUrl();
    emailSent = await sendReservationEmail({
      to: data.email,
      kind: "created",
      firstName: data.firstName,
      people: data.people,
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      themeColor: event.themeColor,
      manageUrl: `${baseUrl}/prenotazione/${token}`,
    });
  }

  revalidatePath(`/serata/${eventId}`);

  return {
    status: "success",
    emailProvided: Boolean(data.email),
    emailSent,
    firstName: data.firstName,
    people: data.people,
  };
}

export async function updateReservationByToken(
  token: string,
  _prev: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const reservation = await db.reservation.findUnique({
    where: { token },
    include: { event: true },
  });
  if (!reservation) return { status: "error", message: "Prenotazione non trovata." };
  if (isPast(reservation.event.date)) {
    return {
      status: "error",
      message: "Questa serata si è già svolta: la prenotazione non è più modificabile.",
    };
  }

  const { data, errors } = parseReservationForm(formData);
  if (!data) return { status: "error", errors };

  await db.reservation.update({ where: { token }, data });

  let emailSent = false;
  if (data.email) {
    const baseUrl = await getBaseUrl();
    emailSent = await sendReservationEmail({
      to: data.email,
      kind: "updated",
      firstName: data.firstName,
      people: data.people,
      eventName: reservation.event.name,
      eventDate: reservation.event.date,
      eventTime: reservation.event.time,
      themeColor: reservation.event.themeColor,
      manageUrl: `${baseUrl}/prenotazione/${token}`,
    });
  }

  revalidatePath(`/prenotazione/${token}`);

  return {
    status: "success",
    emailProvided: Boolean(data.email),
    emailSent,
    firstName: data.firstName,
    people: data.people,
  };
}

export async function cancelReservationByToken(
  token: string
): Promise<{ ok: boolean; message?: string }> {
  const reservation = await db.reservation.findUnique({
    where: { token },
    include: { event: true },
  });
  if (!reservation) return { ok: false, message: "Prenotazione non trovata." };
  if (isPast(reservation.event.date)) {
    return {
      ok: false,
      message: "Questa serata si è già svolta: la prenotazione non è più cancellabile.",
    };
  }

  await db.reservation.delete({ where: { token } });
  // Niente revalidatePath: farebbe ri-renderizzare subito questa pagina come
  // "prenotazione non trovata" invece di mostrare la conferma di cancellazione.
  return { ok: true };
}
