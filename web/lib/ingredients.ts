/**
 * Client-sichere Typen/Konstanten/Helfer rund um Backstube-Zutaten & Rezepte.
 * Bewusst OHNE Server-Import (createClient), damit Client-Komponenten
 * (MenuAdmin, IngredientsAdmin, Bestellungen-Tabs) hieraus importieren dürfen.
 * Der eigentliche Server-Loader liegt in `lib/getIngredients.ts`.
 */

export type Ingredient = {
  id: string;
  name: string;
  /** Feste Einheit, z. B. "g", "ml", "Stück". */
  unit: string;
  sortOrder: number;
};

/** Maximale Zahl an Zutaten pro Backware (UI + Server-Validierung). */
export const MAX_RECIPE_LINES = 10;

/** Vorschläge für das Einheiten-Feld (Freitext bleibt erlaubt). */
export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "Stück",
  "EL",
  "TL",
  "Prise",
] as const;

/** Menge hübsch: "1.500" → "1,5"; deutsches Komma, keine Nachkomma-Nullen. */
export function formatAmount(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}
