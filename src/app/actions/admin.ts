"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
  verifyPin,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { sendReservationEmail } from "@/lib/email";
import { deleteHeroImage, saveHeroImage } from "@/lib/uploads";
import {
  parseEventForm,
  parseReservationForm,
  type FieldErrors,
} from "@/lib/validation";

export type AdminFormState = {
  status: "idle" | "success" | "error";
  errors?: FieldErrors;
  message?: string;
};

// ---------------------------------------------------------------------------
// Autenticazione
// ---------------------------------------------------------------------------

export async function loginAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const pin = String(formData.get("pin") ?? "");
  // Rallenta i tentativi di forza bruta
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!verifyPin(pin)) {
    return { status: "error", message: "PIN errato. Riprova." };
  }
  await createAdminSession();
  redirect("/admin/serate");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// CRUD serate
// ---------------------------------------------------------------------------

async function extractHeroImage(
  formData: FormData
): Promise<{ filename?: string | null; error?: string }> {
  const file = formData.get("heroImage");
  if (!(file instanceof File) || file.size === 0) return { filename: undefined };
  const result = await saveHeroImage(file);
  if (result.error) return { error: result.error };
  return { filename: result.filename };
}

export async function createEvent(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const { data, errors } = parseEventForm(formData);
  if (!data) return { status: "error", errors };

  const image = await extractHeroImage(formData);
  if (image.error) return { status: "error", errors: { heroImage: image.error } };

  await db.event.create({ data: { ...data, heroImage: image.filename ?? null } });

  revalidatePath("/");
  redirect("/admin/serate");
}

export async function updateEvent(
  eventId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { status: "error", message: "Serata non trovata." };

  const { data, errors } = parseEventForm(formData);
  if (!data) return { status: "error", errors };

  const image = await extractHeroImage(formData);
  if (image.error) return { status: "error", errors: { heroImage: image.error } };

  const removeImage = formData.get("removeImage") === "on";
  let heroImage = event.heroImage;
  if (image.filename) {
    await deleteHeroImage(event.heroImage);
    heroImage = image.filename;
  } else if (removeImage) {
    await deleteHeroImage(event.heroImage);
    heroImage = null;
  }

  await db.event.update({ where: { id: eventId }, data: { ...data, heroImage } });

  revalidatePath("/");
  revalidatePath(`/serata/${eventId}`);
  redirect(`/admin/serate/${eventId}`);
}

export async function toggleEventOpen(eventId: string): Promise<void> {
  await requireAdmin();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return;
  await db.event.update({ where: { id: eventId }, data: { isOpen: !event.isOpen } });
  revalidatePath("/");
  revalidatePath(`/serata/${eventId}`);
  revalidatePath("/admin/serate");
  revalidatePath(`/admin/serate/${eventId}`);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await requireAdmin();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return;
  await deleteHeroImage(event.heroImage);
  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  revalidatePath("/admin/serate");
  redirect("/admin/serate");
}

// ---------------------------------------------------------------------------
// Gestione prenotazioni (admin)
// ---------------------------------------------------------------------------

export async function adminSaveReservation(
  eventId: string,
  reservationId: string | null,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { status: "error", message: "Serata non trovata." };

  const { data, errors } = parseReservationForm(formData);
  if (!data) return { status: "error", errors };

  if (reservationId) {
    const existing = await db.reservation.findUnique({ where: { id: reservationId } });
    if (!existing || existing.eventId !== eventId) {
      return { status: "error", message: "Prenotazione non trovata." };
    }
    await db.reservation.update({ where: { id: reservationId }, data });
  } else {
    const token = randomBytes(24).toString("base64url");
    await db.reservation.create({ data: { ...data, eventId, token } });
    // Se l'admin inserisce una prenotazione con email (es. presa al telefono),
    // il cliente riceve comunque il suo link di gestione.
    if (data.email) {
      const baseUrl = await getBaseUrl();
      await sendReservationEmail({
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
  }

  revalidatePath(`/admin/serate/${eventId}`);
  return { status: "success" };
}

export async function adminDeleteReservation(reservationId: string): Promise<void> {
  await requireAdmin();
  const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) return;
  await db.reservation.delete({ where: { id: reservationId } });
  revalidatePath(`/admin/serate/${reservation.eventId}`);
}
