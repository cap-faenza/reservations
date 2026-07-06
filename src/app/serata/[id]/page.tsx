import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Lock, QrCode } from "lucide-react";
import { EventHero } from "@/components/event-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/config";
import { db } from "@/lib/db";
import { formatDateLong, isPast } from "@/lib/format";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) return { title: "Serata non trovata" };
  return {
    title: event.name,
    description: event.description.slice(0, 160) || `Prenota il tuo posto per ${event.name}.`,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  const closed = !event.isOpen || isPast(event.date);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Tutte le serate
          </Link>
          <span className="text-sm font-semibold tracking-tight">{SITE_NAME}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="aspect-[21/9] overflow-hidden rounded-2xl shadow-sm">
          <EventHero
            name={event.name}
            heroImage={event.heroImage}
            themeColor={event.themeColor}
          />
        </div>

        <div className="mt-6 space-y-3">
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-1 font-medium"
            style={{ color: event.themeColor }}
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDateLong(event.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              ore {event.time}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {event.name}
          </h1>
          {event.description && (
            <p className="whitespace-pre-line text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-8">
          {closed ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Lock className="size-8 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-lg font-medium">
                  {isPast(event.date)
                    ? "Questa serata si è già svolta."
                    : "Le prenotazioni per questa serata sono chiuse."}
                </p>
                <Button asChild variant="outline">
                  <Link href="/">Guarda le altre serate</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Prenota il tuo posto</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm eventId={event.id} themeColor={event.themeColor} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Vuoi far conoscere questa serata? Scarica il QR code da stampare o condividere.
          </p>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/qr/${event.id}`} download>
              <QrCode />
              Scarica QR code
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
