import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Pencil, Users } from "lucide-react";
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
import { formatDateShort, isPast } from "@/lib/format";
import { DeleteEventButton, ToggleOpenButton } from "./event-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serate — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: [{ date: "desc" }, { time: "desc" }],
    include: { reservations: { select: { people: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Serate</h1>
        <Button asChild>
          <Link href="/admin/serate/nuova">
            <CalendarPlus />
            Nuova serata
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-lg font-medium">Nessuna serata ancora creata</p>
            <p className="text-muted-foreground">
              Crea la prima serata per iniziare a ricevere prenotazioni.
            </p>
            <Button asChild className="mt-2">
              <Link href="/admin/serate/nuova">
                <CalendarPlus />
                Crea la prima serata
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serata</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Prenotazioni</TableHead>
                <TableHead className="text-right">Persone</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const totalPeople = event.reservations.reduce(
                  (sum, r) => sum + r.people,
                  0
                );
                const past = isPast(event.date);
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/serate/${event.id}`}
                        className="inline-flex items-center gap-2 hover:underline"
                      >
                        <span
                          aria-hidden
                          className="inline-block size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: event.themeColor }}
                        />
                        {event.name}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateShort(event.date)}, {event.time}
                    </TableCell>
                    <TableCell>
                      {past ? (
                        <Badge variant="outline">Conclusa</Badge>
                      ) : event.isOpen ? (
                        <Badge className="bg-green-600 text-white">Aperta</Badge>
                      ) : (
                        <Badge variant="secondary">Chiusa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {event.reservations.length}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {totalPeople}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/serate/${event.id}`}>
                            <Users />
                            <span className="hidden lg:inline">Prenotati</span>
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Modifica">
                          <Link href={`/admin/serate/${event.id}/modifica`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <ToggleOpenButton
                          eventId={event.id}
                          isOpen={event.isOpen}
                          disabled={past}
                        />
                        <DeleteEventButton
                          eventId={event.id}
                          eventName={event.name}
                          reservationCount={event.reservations.length}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
