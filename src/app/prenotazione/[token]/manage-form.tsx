"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { ReservationFields } from "@/components/reservation-fields";
import { contrastText } from "@/lib/color";
import {
  cancelReservationByToken,
  updateReservationByToken,
  type ReservationFormState,
} from "@/app/actions/reservations";

type ManageFormProps = {
  token: string;
  themeColor: string;
  defaults: {
    firstName: string;
    lastName: string;
    email: string | null;
    people: number;
  };
};

const initialState: ReservationFormState = { status: "idle" };

export function ManageForm({ token, themeColor, defaults }: ManageFormProps) {
  const [state, formAction, pending] = useActionState(
    updateReservationByToken.bind(null, token),
    initialState
  );
  const [cancelled, setCancelled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, startCancel] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Prenotazione aggiornata!", {
        description: state.emailSent
          ? "Ti abbiamo inviato un'email di conferma."
          : undefined,
      });
    }
  }, [state]);

  function handleCancel() {
    startCancel(async () => {
      const result = await cancelReservationByToken(token);
      if (result.ok) {
        setDialogOpen(false);
        setCancelled(true);
      } else {
        toast.error(result.message ?? "Cancellazione non riuscita. Riprova.");
      }
    });
  }

  if (cancelled) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-muted-foreground" />
        <p className="text-xl font-semibold">Prenotazione cancellata</p>
        <p className="text-muted-foreground">
          Ci dispiace non averti con noi! Ti aspettiamo a una delle prossime serate.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/">Guarda le serate in programma</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5">
        <ReservationFields defaults={defaults} errors={state.errors} />

        {state.message && (
          <p className="text-sm font-medium text-destructive">{state.message}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full font-semibold"
          style={{ backgroundColor: themeColor, color: contrastText(themeColor) }}
        >
          {pending ? "Salvataggio…" : "Salva le modifiche"}
        </Button>
      </form>

      <Separator />

      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Non puoi più venire? Puoi cancellare la prenotazione.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              <Trash2 />
              Cancella prenotazione
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancellare la prenotazione?</DialogTitle>
              <DialogDescription>
                La prenotazione verrà eliminata definitivamente. Potrai sempre
                prenotarti di nuovo finché ci sono posti.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                No, torna indietro
              </Button>
              <Button
                variant="destructive"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? "Cancellazione…" : "Sì, cancella"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
