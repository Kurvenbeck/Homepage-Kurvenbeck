"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Verwaltung der Zutaten-Stammdaten der Backstube (zentrale Liste für die
 * Rezept-Dropdowns). Läuft mit der eingeloggten Sitzung; Autorisierung erzwingt
 * RLS (`is_admin()`), kein service_role.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return supabase;
}

function fail(error: unknown): ActionResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Unbekannter Fehler.",
  };
}

function revalidate() {
  // Rezept-Dropdowns + Bedarfsrechnung hängen an den Stammdaten.
  revalidatePath("/admin");
  revalidatePath("/admin/bestellungen");
}

export async function createIngredient(
  name: string,
  unit: string,
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const cleanName = name.trim().slice(0, 80);
    const cleanUnit = unit.trim().slice(0, 20);
    if (!cleanName) return { ok: false, error: "Bitte einen Zutaten-Namen eingeben." };
    if (!cleanUnit) return { ok: false, error: "Bitte eine Einheit angeben (z. B. g, ml, Stück)." };

    // Höchsten sort_order ermitteln, neue Zutat ans Ende.
    const { data: rows } = await supabase
      .from("backstube_ingredients")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

    const { error } = await supabase
      .from("backstube_ingredients")
      .insert({ name: cleanName, unit: cleanUnit, sort_order: nextOrder });
    if (error) {
      // Eindeutiger Index auf lower(name) → freundliche Meldung.
      if (error.code === "23505")
        return { ok: false, error: `„${cleanName}" gibt es schon.` };
      throw error;
    }

    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateIngredient(
  id: string,
  name: string,
  unit: string,
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const cleanName = name.trim().slice(0, 80);
    const cleanUnit = unit.trim().slice(0, 20);
    if (!cleanName) return { ok: false, error: "Bitte einen Zutaten-Namen eingeben." };
    if (!cleanUnit) return { ok: false, error: "Bitte eine Einheit angeben (z. B. g, ml, Stück)." };

    const { error } = await supabase
      .from("backstube_ingredients")
      .update({ name: cleanName, unit: cleanUnit })
      .eq("id", id);
    if (error) {
      if (error.code === "23505")
        return { ok: false, error: `„${cleanName}" gibt es schon.` };
      throw error;
    }

    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteIngredient(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();

    // Wird die Zutat noch in einem Rezept verwendet? Dann blocken (FK würde eh
    // greifen, aber so kommt eine verständliche Meldung mit Anzahl).
    const { count, error: countError } = await supabase
      .from("menu_item_ingredients")
      .select("menu_item_id", { count: "exact", head: true })
      .eq("ingredient_id", id);
    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error:
          count === 1
            ? "Diese Zutat wird noch in 1 Rezept verwendet. Erst dort entfernen."
            : `Diese Zutat wird noch in ${count} Rezepten verwendet. Erst dort entfernen.`,
      };
    }

    const { error } = await supabase
      .from("backstube_ingredients")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
