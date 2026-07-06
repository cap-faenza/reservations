"use client";

import { useActionState, useState } from "react";
import { Check, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/reservation-fields";
import { heroImageUrl } from "@/lib/images";
import { contrastText } from "@/lib/color";
import {
  createEvent,
  updateEvent,
  type AdminFormState,
} from "@/app/actions/admin";

const PRESET_COLORS = [
  { value: "#e11d48", label: "Rosso lampone" },
  { value: "#ea580c", label: "Arancio" },
  { value: "#d97706", label: "Ambra" },
  { value: "#16a34a", label: "Verde" },
  { value: "#0d9488", label: "Verde acqua" },
  { value: "#2563eb", label: "Blu" },
  { value: "#7c3aed", label: "Viola" },
  { value: "#c026d3", label: "Fucsia" },
];

type EventFormProps = {
  eventId?: string;
  defaults?: {
    name: string;
    description: string;
    date: string;
    time: string;
    bookingDeadline: string | null;
    themeColor: string;
    isOpen: boolean;
    heroImage: string | null;
  };
};

const initialState: AdminFormState = { status: "idle" };

export function EventForm({ eventId, defaults }: EventFormProps) {
  const action = eventId ? updateEvent.bind(null, eventId) : createEvent;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [themeColor, setThemeColor] = useState(defaults?.themeColor ?? "#e11d48");
  const [preview, setPreview] = useState<string | null>(
    heroImageUrl(defaults?.heroImage ?? null)
  );
  const [newFileChosen, setNewFileChosen] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const hasExistingImage = Boolean(defaults?.heroImage);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setNewFileChosen(true);
      setRemoveImage(false);
    } else {
      setPreview(heroImageUrl(defaults?.heroImage ?? null));
      setNewFileChosen(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome della serata *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults?.name}
          placeholder="Serata paella e sangria"
          required
        />
        <FieldError message={state.errors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaults?.date}
            required
          />
          <FieldError message={state.errors?.date} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Ora di inizio *</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={defaults?.time ?? "20:00"}
            required
          />
          <FieldError message={state.errors?.time} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bookingDeadline">Prenotazioni fino al</Label>
          <Input
            id="bookingDeadline"
            name="bookingDeadline"
            type="date"
            defaultValue={defaults?.bookingDeadline ?? ""}
          />
          <FieldError message={state.errors?.bookingDeadline} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          placeholder="Racconta la serata: menù, musica, ospiti…"
          rows={4}
        />
        <FieldError message={state.errors?.description} />
      </div>

      <div className="space-y-2">
        <Label>Colore tema *</Label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              aria-label={color.label}
              aria-pressed={themeColor === color.value}
              onClick={() => setThemeColor(color.value)}
              className="flex size-8 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color.value }}
            >
              {themeColor === color.value && (
                <Check className="size-4" style={{ color: contrastText(color.value) }} />
              )}
            </button>
          ))}
          <label
            className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            title="Colore personalizzato"
          >
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="size-8 cursor-pointer rounded-full border p-0.5"
            />
            Personalizzato
          </label>
        </div>
        <input type="hidden" name="themeColor" value={themeColor} />
        <FieldError message={state.errors?.themeColor} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heroImage">Immagine hero</Label>
        {preview && !removeImage && (
          <div className="aspect-[21/9] w-full max-w-md overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Anteprima immagine" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <ImagePlus className="size-4 text-muted-foreground" />
          <Input
            id="heroImage"
            name="heroImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="max-w-md"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          JPG, PNG o WebP, massimo 5 MB. Se assente viene mostrato un motivo nel colore tema.
        </p>
        {hasExistingImage && !newFileChosen && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removeImage"
              checked={removeImage}
              onChange={(e) => setRemoveImage(e.target.checked)}
              className="size-4 accent-current"
            />
            Rimuovi l&apos;immagine attuale
          </label>
        )}
        <FieldError message={state.errors?.heroImage} />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isOpen"
          defaultChecked={defaults?.isOpen ?? true}
          className="size-4 accent-current"
        />
        Prenotazioni aperte
      </label>

      {state.message && (
        <p className="text-sm font-medium text-destructive">{state.message}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvataggio…"
            : eventId
              ? "Salva le modifiche"
              : "Crea la serata"}
        </Button>
      </div>
    </form>
  );
}
