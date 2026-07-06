import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/config";
import { db } from "@/lib/db";
import { formatDateLong, isPast } from "@/lib/format";
import { ManageForm } from "./manage-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La tua prenotazione",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ token: string }> };

export default async function ManageReservationPage({ params }: PageProps) {
  const { token } = await params;
  const reservation = await db.reservation.findUnique({
    where: { token },
    include: { event: true },
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {SITE_NAME}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {!reservation ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <SearchX className="size-10 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-lg font-medium">Prenotazione non trovata</p>
              <p className="max-w-md text-muted-foreground">
                Il link non è valido oppure la prenotazione è stata cancellata.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/">Guarda le serate in programma</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                La tua prenotazione per
              </p>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: reservation.event.themeColor }}
              >
                {reservation.event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {formatDateLong(reservation.event.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  ore {reservation.event.time}
                </span>
              </div>
            </div>

            {isPast(reservation.event.date) ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Questa serata si è già svolta: la prenotazione non è più
                  modificabile. Grazie per essere stato con noi!
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Modifica o cancella</CardTitle>
                </CardHeader>
                <CardContent>
                  <ManageForm
                    token={reservation.token}
                    themeColor={reservation.event.themeColor}
                    defaults={{
                      firstName: reservation.firstName,
                      lastName: reservation.lastName,
                      email: reservation.email,
                      people: reservation.people,
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
