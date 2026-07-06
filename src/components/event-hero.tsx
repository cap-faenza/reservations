import { Sparkles } from "lucide-react";
import { heroImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type EventHeroProps = {
  name: string;
  heroImage: string | null;
  themeColor: string;
  className?: string;
};

/** Immagine hero della serata, con fallback a un gradiente nel colore tema. */
export function EventHero({ name, heroImage, themeColor, className }: EventHeroProps) {
  const url = heroImageUrl(heroImage);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`Immagine della serata ${name}`}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn("flex h-full w-full items-center justify-center", className)}
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${themeColor} 80%, white) 0%, ${themeColor} 55%, color-mix(in srgb, ${themeColor} 65%, black) 100%)`,
      }}
    >
      <Sparkles className="size-12 text-white/60" strokeWidth={1.5} />
    </div>
  );
}
