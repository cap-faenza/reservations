import { MAX_PEOPLE_PER_RESERVATION } from "./config";
import { isValidHexColor } from "./color";

export type FieldErrors = Record<string, string>;

export type ReservationInput = {
  firstName: string;
  lastName: string;
  email: string | null;
  people: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseReservationForm(formData: FormData): {
  data?: ReservationInput;
  errors?: FieldErrors;
} {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const peopleRaw = String(formData.get("people") ?? "").trim();

  const errors: FieldErrors = {};

  if (!firstName) errors.firstName = "Il nome è obbligatorio.";
  else if (firstName.length > 100) errors.firstName = "Il nome è troppo lungo.";

  if (!lastName) errors.lastName = "Il cognome è obbligatorio.";
  else if (lastName.length > 100) errors.lastName = "Il cognome è troppo lungo.";

  let email: string | null = null;
  if (emailRaw) {
    if (emailRaw.length > 200 || !EMAIL_REGEX.test(emailRaw)) {
      errors.email = "L'indirizzo email non è valido.";
    } else {
      email = emailRaw.toLowerCase();
    }
  }

  const people = Number.parseInt(peopleRaw, 10);
  if (!Number.isInteger(people) || people < 1) {
    errors.people = "Indica per quante persone prenoti (almeno 1).";
  } else if (people > MAX_PEOPLE_PER_RESERVATION) {
    errors.people = `Massimo ${MAX_PEOPLE_PER_RESERVATION} persone per prenotazione.`;
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { data: { firstName, lastName, email, people } };
}

export type EventInput = {
  name: string;
  description: string;
  date: string;
  time: string;
  themeColor: string;
  isOpen: boolean;
};

export function parseEventForm(formData: FormData): {
  data?: EventInput;
  errors?: FieldErrors;
} {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const themeColor = String(formData.get("themeColor") ?? "").trim().toLowerCase();
  const isOpen = formData.get("isOpen") === "on";

  const errors: FieldErrors = {};

  if (!name) errors.name = "Il nome della serata è obbligatorio.";
  else if (name.length > 150) errors.name = "Il nome è troppo lungo.";

  if (description.length > 5000) errors.description = "La descrizione è troppo lunga.";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Indica la data della serata.";

  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Indica l'ora di inizio.";

  if (!isValidHexColor(themeColor)) errors.themeColor = "Scegli un colore tema valido.";

  if (Object.keys(errors).length > 0) return { errors };
  return { data: { name, description, date, time, themeColor, isOpen } };
}
