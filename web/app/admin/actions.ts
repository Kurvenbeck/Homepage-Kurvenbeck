"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { assertArea, type MenuArea } from "@/lib/menuAreas";

/**
 * Schreib-Aktionen für die Menü-Verwaltung. Alle laufen serverseitig mit der
 * eingeloggten Sitzung; die eigentliche Autorisierung erzwingt RLS
 * (`is_admin()` gegen die `admins`-Tabelle) — kein service_role im Spiel.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/** "12,90" / "12.90" / " 12 " → 12.9 (oder null bei ungültig/negativ). */
function parsePrice(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

/** Rezept-Menge "1,5" / "300" → Zahl (max. 3 Nachkommastellen), null bei ungültig. */
function parseAmount(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 1000) / 1000;
}

/** Höchstzahl Rezept-Zeilen pro Backware (deckt sich mit lib/ingredients). */
const MAX_RECIPE_LINES = 10;

async function getSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return supabase;
}

function revalidate(area: MenuArea) {
  revalidatePath(`/${area}`);
  revalidatePath("/admin");
}

function fail(error: unknown): ActionResult {
  const message =
    error instanceof Error ? error.message : "Unbekannter Fehler.";
  return { ok: false, error: message };
}

// --- Kategorien ------------------------------------------------------------

export async function createCategory(
  area: string,
  title: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const clean = title.trim();
    if (!clean) return { ok: false, error: "Bitte einen Titel eingeben." };

    const { data: rows } = await supabase
      .from("menu_categories")
      .select("sort_order")
      .eq("area", menuArea)
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

    const { error } = await supabase
      .from("menu_categories")
      .insert({ area: menuArea, title: clean, sort_order: nextOrder });
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function renameCategory(
  area: string,
  id: string,
  title: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const clean = title.trim();
    if (!clean) return { ok: false, error: "Bitte einen Titel eingeben." };

    const { error } = await supabase
      .from("menu_categories")
      .update({ title: clean })
      .eq("id", id);
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(
  area: string,
  id: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    // Gerichte hängen per ON DELETE CASCADE dran.
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function moveCategory(
  area: string,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const { data: cats, error } = await supabase
      .from("menu_categories")
      .select("id, sort_order")
      .eq("area", menuArea)
      .order("sort_order");
    if (error) throw error;

    const swapped = await swapNeighbor(supabase, "menu_categories", cats ?? [], id, direction);
    if (!swapped) return { ok: true };

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// --- Gerichte --------------------------------------------------------------

export async function createItem(
  area: string,
  categoryId: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const { data: rows } = await supabase
      .from("menu_items")
      .select("sort_order")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("menu_items").insert({
      category_id: categoryId,
      name: "Neuer Eintrag",
      price: 0,
      sort_order: nextOrder,
    });
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Rezept-Zeile aus dem Editor: Zutat-ID + Menge als Eingabe-String. */
export type RecipeLineInput = { ingredientId: string; amount: string };

export type ItemInput = {
  name: string;
  description: string;
  price: string;
  tags: string[];
  isAvailable: boolean;
  isRecommendation: boolean;
  allergens: string[];
  /** Rezept (nur Backstube gepflegt). Leere Zeilen werden ignoriert. */
  recipe: RecipeLineInput[];
};

export async function updateItem(
  area: string,
  id: string,
  input: ItemInput,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Bitte einen Namen eingeben." };

    const price = parsePrice(input.price);
    if (price === null)
      return { ok: false, error: "Bitte einen gültigen Preis eingeben (z. B. 12,90)." };

    const { error: itemError } = await supabase
      .from("menu_items")
      .update({
        name,
        description: input.description.trim() || null,
        price,
        tags: input.tags,
        is_available: input.isAvailable,
        is_recommendation: input.isRecommendation,
      })
      .eq("id", id);
    if (itemError) throw itemError;

    // Allergen-Verknüpfungen neu setzen (löschen + einfügen).
    const { error: delError } = await supabase
      .from("menu_item_allergens")
      .delete()
      .eq("menu_item_id", id);
    if (delError) throw delError;

    if (input.allergens.length > 0) {
      const { error: insError } = await supabase
        .from("menu_item_allergens")
        .insert(
          input.allergens.map((code) => ({
            menu_item_id: id,
            allergen_code: code,
          })),
        );
      if (insError) throw insError;
    }

    // Rezept-Zeilen neu setzen (nur Backstube gepflegt; leere Zeilen ignorieren).
    // Erst normalisieren + validieren, dann löschen + einfügen.
    const recipeRows: { ingredient_id: string; amount: number; sort_order: number }[] = [];
    const seen = new Set<string>();
    for (const line of input.recipe ?? []) {
      const ingredientId = line.ingredientId.trim();
      if (!ingredientId) continue; // leere Zeile (nur Platzhalter) → ignorieren
      if (seen.has(ingredientId))
        return { ok: false, error: "Eine Zutat ist doppelt im Rezept." };
      const amount = parseAmount(line.amount);
      if (amount === null)
        return { ok: false, error: "Bitte für jede Zutat eine gültige Menge eingeben." };
      seen.add(ingredientId);
      recipeRows.push({ ingredient_id: ingredientId, amount, sort_order: recipeRows.length });
    }
    if (recipeRows.length > MAX_RECIPE_LINES)
      return { ok: false, error: `Höchstens ${MAX_RECIPE_LINES} Zutaten pro Backware.` };

    const { error: delRecipeError } = await supabase
      .from("menu_item_ingredients")
      .delete()
      .eq("menu_item_id", id);
    if (delRecipeError) throw delRecipeError;

    if (recipeRows.length > 0) {
      const { error: insRecipeError } = await supabase
        .from("menu_item_ingredients")
        .insert(recipeRows.map((r) => ({ menu_item_id: id, ...r })));
      if (insRecipeError) throw insRecipeError;
    }

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteItem(
  area: string,
  id: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function moveItem(
  area: string,
  id: string,
  categoryId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const { data: items, error } = await supabase
      .from("menu_items")
      .select("id, sort_order")
      .eq("category_id", categoryId)
      .order("sort_order");
    if (error) throw error;

    const swapped = await swapNeighbor(supabase, "menu_items", items ?? [], id, direction);
    if (!swapped) return { ok: true };

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// --- Helfer ----------------------------------------------------------------

type Sortable = { id: string; sort_order: number };

/** Tauscht sort_order des Ziels mit dem Nachbarn in Richtung. */
async function swapNeighbor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "menu_categories" | "menu_items",
  rows: Sortable[],
  id: string,
  direction: "up" | "down",
): Promise<boolean> {
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return false;
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= rows.length) return false;

  const current = rows[index];
  const neighbor = rows[neighborIndex];

  const { error: e1 } = await supabase
    .from(table)
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id);
  if (e1) throw e1;
  const { error: e2 } = await supabase
    .from(table)
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id);
  if (e2) throw e2;

  return true;
}
