"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReservationFields } from "@/components/reservation-fields";
import {
  adminDeleteReservation,
  adminSaveReservation,
  type AdminFormState,
} from "@/app/actions/admin";

type ReservationData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  people: number;
};

const initialState: AdminFormState = { status: "idle" };

function ReservationDialog({
  eventId,
  reservation,
  open,
  onOpenChange,
}: {
  eventId: string;
  reservation: ReservationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    adminSaveReservation.bind(null, eventId, reservation?.id ?? null),
    initialState
  );

  useEffect(() => {
    if (state.status === "success" && open) {
      toast.success(
        reservation ? "Prenotazione aggiornata." : "Prenotazione aggiunta."
      );
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {reservation ? "Modifica prenotazione" : "Nuova prenotazione"}
          </DialogTitle>
          <DialogDescription>
            {reservation
              ? `Prenotazione di ${reservation.firstName} ${reservation.lastName}.`
              : "Inserisci una prenotazione per conto di un cliente (es. presa al telefono)."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          <ReservationFields
            defaults={reservation ?? undefined}
            errors={state.errors}
            emailHint="Se presente, il cliente riceve il link per gestire da solo la prenotazione."
          />
          {state.message && (
            <p className="text-sm font-medium text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvataggio…" : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddReservationButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus />
        Aggiungi prenotazione
      </Button>
      {open && (
        <ReservationDialog
          eventId={eventId}
          reservation={null}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}

export function ReservationRowActions({
  eventId,
  reservation,
}: {
  eventId: string;
  reservation: ReservationData;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Modifica prenotazione"
        title="Modifica prenotazione"
        onClick={() => setEditOpen(true)}
      >
        <Pencil />
      </Button>
      {editOpen && (
        <ReservationDialog
          eventId={eventId}
          reservation={reservation}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Elimina prenotazione"
            title="Elimina prenotazione"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare la prenotazione?</DialogTitle>
            <DialogDescription>
              La prenotazione di {reservation.firstName} {reservation.lastName} (
              {reservation.people}{" "}
              {reservation.people === 1 ? "persona" : "persone"}) verrà eliminata
              definitivamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() =>
                startDelete(async () => {
                  await adminDeleteReservation(reservation.id);
                  toast.success("Prenotazione eliminata.");
                  setDeleteOpen(false);
                })
              }
            >
              {deleting ? "Eliminazione…" : "Sì, elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
