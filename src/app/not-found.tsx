import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="size-12 text-muted-foreground" strokeWidth={1.5} />
      <h1 className="text-2xl font-bold tracking-tight">Pagina non trovata</h1>
      <p className="max-w-md text-muted-foreground">
        La pagina che cerchi non esiste o è stata rimossa.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Torna alle serate</Link>
      </Button>
    </div>
  );
}
