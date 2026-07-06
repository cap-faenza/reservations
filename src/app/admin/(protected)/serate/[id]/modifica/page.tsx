import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { EventForm } from "../../event-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modifica serata — Admin",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <Link
          href={`/admin/serate/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Torna alla serata
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifica «{event.name}»
        </h1>
      </div>
      <EventForm
        eventId={event.id}
        defaults={{
          name: event.name,
          description: event.description,
          date: event.date,
          time: event.time,
          themeColor: event.themeColor,
          isOpen: event.isOpen,
          heroImage: event.heroImage,
        }}
      />
    </div>
  );
}
