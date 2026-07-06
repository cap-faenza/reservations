"use client";

import { useActionState } from "react";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationFields } from "@/components/reservation-fields";
import { contrastText } from "@/lib/color";
import {
  createReservation,
  type ReservationFormState,
} from "@/app/actions/reservations";

type BookingFormProps = {
  eventId: string;
  themeColor: string;
};

const initialState: ReservationFormState = { status: "idle" };

export function BookingForm({ eventId, themeColor }: BookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createReservation.bind(null, eventId),
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <PartyPopper className="size-10" style={{ color: themeColor }} />
        <p className="text-xl font-semibold">Prenotazione confermata!</p>
        <p className="text-muted-foreground">
          Grazie {state.firstName}, abbiamo riservato{" "}
          {state.people === 1 ? "un posto" : `${state.people} posti`} per te.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {state.emailSent
            ? "Ti abbiamo inviato un’email con il link per modificare o cancellare la prenotazione."
            : state.emailProvided
              ? "Non siamo riusciti a inviare l’email con il link di gestione: per modifiche o cancellazioni contatta gli organizzatori."
              : "Per modificare o cancellare la prenotazione contatta gli organizzatori."}
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Fai un&apos;altra prenotazione
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <ReservationFields errors={state.errors} />

      {state.message && (
        <p className="text-sm font-medium text-destructive">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full text-base font-semibold"
        size="lg"
        style={{ backgroundColor: themeColor, color: contrastText(themeColor) }}
      >
        {pending ? "Invio in corso…" : "Prenota"}
      </Button>
    </form>
  );
}
