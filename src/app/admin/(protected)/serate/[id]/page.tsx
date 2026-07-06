import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Pencil,
  QrCode,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDateLong, formatDateShort, isPast } from "@/lib/format";
import { AddReservationButton, ReservationRowActions } from "./reservation-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prenotazioni — Admin",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      reservations: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }] },
    },
  });
  if (!event) notFound();

  const totalPeople = event.reservations.reduce((sum, r) => sum + r.people, 0);
  const past = isPast(event.date);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/serate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Tutte le serate
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: event.themeColor }}
          >
            {event.name}
          </h1>
          {past ? (
            <Badge variant="outline">Conclusa</Badge>
          ) : event.isOpen ? (
            <Badge className="bg-green-600 text-white">Aperta</Badge>
          ) : (
            <Badge variant="secondary">Chiusa</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDateLong(event.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            ore {event.time}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/serata/${event.id}`} target="_blank">
            <ExternalLink />
            Pagina pubblica
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/qr/${event.id}`} download>
            <QrCode />
            Scarica QR code
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/serate/${event.id}/modifica`}>
            <Pencil />
            Modifica serata
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between px-6">
            <div>
              <p className="text-sm text-muted-foreground">Prenotazioni</p>
              <p className="text-3xl font-bold tabular-nums">
                {event.reservations.length}
              </p>
            </div>
            <Users className="size-8 text-muted-foreground" strokeWidth={1.5} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between px-6">
            <div>
              <p className="text-sm text-muted-foreground">Persone totali</p>
              <p className="text-3xl font-bold tabular-nums">{totalPeople}</p>
            </div>
            <Users className="size-8" strokeWidth={1.5} style={{ color: event.themeColor }} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Prenotati</h2>
        <AddReservationButton eventId={event.id} />
      </div>

      {event.reservations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Ancora nessuna prenotazione per questa serata.
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Persone</TableHead>
                <TableHead>Prenotata il</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.lastName} {reservation.firstName}
                  </TableCell>
                  <TableCell>
                    {reservation.email ?? (
                      <Badge variant="outline" className="font-normal">
                        senza email — solo admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {reservation.people}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateShort(
                      reservation.createdAt.toISOString().slice(0, 10)
                    )}
                  </TableCell>
                  <TableCell>
                    <ReservationRowActions
                      eventId={event.id}
                      reservation={{
                        id: reservation.id,
                        firstName: reservation.firstName,
                        lastName: reservation.lastName,
                        email: reservation.email,
                        people: reservation.people,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
