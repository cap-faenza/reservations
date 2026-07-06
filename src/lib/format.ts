/** Data odierna locale in formato YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** True se la data (YYYY-MM-DD) è precedente a oggi. La serata di oggi non è passata. */
export function isPast(date: string): boolean {
  return date < todayISO();
}

function toDate(date: string): Date {
  // Mezzogiorno per evitare slittamenti di giorno dovuti al fuso orario
  return new Date(`${date}T12:00:00`);
}

/** Es. "Sabato 12 luglio 2026" */
export function formatDateLong(date: string): string {
  const formatted = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(date));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Es. "12 lug 2026" */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(toDate(date));
}

/** Es. "12 luglio 2026, ore 20:30" */
export function formatDateTime(date: string, time: string): string {
  return `${formatDateLong(date)}, ore ${time}`;
}
