"use client";

import { useState, useTransition } from "react";
import { Lock, LockOpen, Trash2 } from "lucide-react";
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
import { deleteEvent, toggleEventOpen } from "@/app/actions/admin";

export function ToggleOpenButton({
  eventId,
  isOpen,
  disabled,
}: {
  eventId: string;
  isOpen: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isOpen ? "Chiudi le prenotazioni" : "Apri le prenotazioni"}
      title={isOpen ? "Chiudi le prenotazioni" : "Apri le prenotazioni"}
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await toggleEventOpen(eventId);
          toast.success(isOpen ? "Prenotazioni chiuse." : "Prenotazioni aperte.");
        })
      }
    >
      {isOpen ? <LockOpen /> : <Lock />}
    </Button>
  );
}

export function DeleteEventButton({
  eventId,
  eventName,
  reservationCount,
}: {
  eventId: string;
  eventName: string;
  reservationCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Elimina serata"
          title="Elimina serata"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminare «{eventName}»?</DialogTitle>
          <DialogDescription>
            {reservationCount > 0
              ? `Verranno eliminate anche le ${reservationCount} prenotazioni collegate. L'operazione non è reversibile.`
              : "L'operazione non è reversibile."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteEvent(eventId);
              })
            }
          >
            {pending ? "Eliminazione…" : "Sì, elimina"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
