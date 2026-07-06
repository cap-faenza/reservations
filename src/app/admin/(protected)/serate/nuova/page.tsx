import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "../event-form";

export const metadata: Metadata = {
  title: "Nuova serata — Admin",
  robots: { index: false, follow: false },
};

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/serate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Tutte le serate
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Nuova serata</h1>
      </div>
      <EventForm />
    </div>
  );
}
