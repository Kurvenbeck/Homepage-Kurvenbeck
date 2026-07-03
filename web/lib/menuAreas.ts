/**
 * Bereiche mit gepflegter Speisekarte (Whitelist). Bewusst getrennt von den
 * Server Actions, da eine `"use server"`-Datei nur async Funktionen exportieren
 * darf — Konstanten/Typen müssen hier liegen.
 */

export const MENU_AREAS = ["biergarten", "backstube"] as const;
export type MenuArea = (typeof MENU_AREAS)[number];

/** true, wenn `area` ein bekannter Bereich ist. */
export function isMenuArea(area: string | undefined | null): area is MenuArea {
  return (MENU_AREAS as readonly string[]).includes(area ?? "");
}

/** Wirft, falls die Area nicht in der Whitelist steht (Schutz gegen freie Eingaben). */
export function assertArea(area: string): MenuArea {
  if (isMenuArea(area)) return area;
  throw new Error("Unbekannter Bereich.");
}
