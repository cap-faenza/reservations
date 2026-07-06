/** URL pubblico dell'immagine hero salvata, o null se assente. */
export function heroImageUrl(filename: string | null): string | null {
  return filename ? `/api/uploads/${filename}` : null;
}
