function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function isLightColor(hex: string): boolean {
  return luminance(hex) > 0.5;
}

/** Colore del testo leggibile sopra uno sfondo del colore dato. */
export function contrastText(hex: string): string {
  return isLightColor(hex) ? "#1c1917" : "#ffffff";
}

/** Colore scuro per i moduli del QR code: usa il colore tema solo se abbastanza scuro da essere scansionabile. */
export function qrDarkColor(hex: string): string {
  return luminance(hex) < 0.25 ? hex : "#1c1917";
}

export function isValidHexColor(value: string): boolean {
  return /^#[a-f\d]{6}$/i.test(value.trim());
}
