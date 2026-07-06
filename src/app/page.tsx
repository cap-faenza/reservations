import Link from "next/link";
import { CalendarDays, Clock, MoonStar } from "lucide-react";
import { EventHero } from "@/components/event-hero";
import { descriptionToPlainText } from "@/components/linked-description";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/config";
import { contrastText } from "@/lib/color";
import { db } from "@/lib/db";
import { formatDateLong, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = todayISO();
  const events = await db.event.findMany({
    where: {
      isOpen: true,
      date: { gte: today },
      OR: [{ bookingDeadline: null }, { bookingDeadline: { gte: today } }],
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 flex items-center justify-between">
          <span className="font-semibold tracking-tight">{SITE_NAME}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Le nostre serate
          </h1>
          <p className="text-lg text-muted-foreground">
            Scegli la serata che fa per te e prenota il tuo posto in un minuto.
          </p>
        </div>

        {events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <MoonStar className="size-10 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-lg font-medium">
                Nessuna serata in programma al momento
              </p>
              <p className="text-muted-foreground">
                Torna a trovarci presto: stiamo preparando qualcosa di speciale!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/serata/${event.id}`}
                className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <div className="aspect-[16/9] overflow-hidden">
                    <EventHero
                      name={event.name}
                      heroImage={event.heroImage}
                      themeColor={event.themeColor}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                    <div
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium"
                      style={{ color: event.themeColor }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4" />
                        {formatDateLong(event.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4" />
                        {event.time}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {event.name}
                    </h2>
                    {event.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {descriptionToPlainText(event.description)}
                      </p>
                    )}
                    <div className="mt-auto pt-3">
                      <span
                        className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
                        style={{
                          backgroundColor: event.themeColor,
                          color: contrastText(event.themeColor),
                        }}
                      >
                        Prenota ora
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>{SITE_NAME}</span>
          <Link href="/admin" className="hover:text-foreground">
            Area riservata
          </Link>
        </div>
      </footer>
    </div>
  );
}
