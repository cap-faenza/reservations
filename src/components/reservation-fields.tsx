"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_PEOPLE_PER_RESERVATION } from "@/lib/config";
import type { FieldErrors } from "@/lib/validation";

type ReservationFieldsProps = {
  defaults?: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    people?: number;
  };
  errors?: FieldErrors;
  emailHint?: string;
};

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

/**
 * Campi del modulo di prenotazione (nome, cognome, email, persone).
 * Controllati, così i valori restano in caso di errore di validazione lato server.
 */
export function ReservationFields({
  defaults,
  errors,
  emailHint = "Se la lasci, ti invieremo un link per modificare o cancellare la prenotazione da solo.",
}: ReservationFieldsProps) {
  const [firstName, setFirstName] = useState(defaults?.firstName ?? "");
  const [lastName, setLastName] = useState(defaults?.lastName ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [people, setPeople] = useState(defaults?.people ?? 2);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Mario"
            autoComplete="given-name"
            required
          />
          <FieldError message={errors?.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Rossi"
            autoComplete="family-name"
            required
          />
          <FieldError message={errors?.lastName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="font-normal text-muted-foreground">(facoltativa)</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email ?? ""}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mario.rossi@esempio.it"
          autoComplete="email"
        />
        {emailHint && <p className="text-sm text-muted-foreground">{emailHint}</p>}
        <FieldError message={errors?.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="people">Numero di persone *</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Meno persone"
            disabled={people <= 1}
            onClick={() => setPeople((p) => Math.max(1, p - 1))}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center text-lg font-semibold tabular-nums">
            {people}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Più persone"
            disabled={people >= MAX_PEOPLE_PER_RESERVATION}
            onClick={() => setPeople((p) => Math.min(MAX_PEOPLE_PER_RESERVATION, p + 1))}
          >
            <Plus />
          </Button>
        </div>
        <input type="hidden" id="people" name="people" value={people} />
        <FieldError message={errors?.people} />
      </div>
    </div>
  );
}
