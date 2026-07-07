import { createClient } from "@/utils/supabase/server";
import type { Ingredient } from "@/lib/ingredients";

/**
 * Server-Loader für die Zutaten-Stammdaten der Backstube (Admin-only). Zentrale
 * Liste, aus der die Rezept-Dropdowns im Speisekarte-Editor gespeist werden —
 * so bleibt „Wasser" überall dieselbe Zutat (Aggregation läuft über die ID).
 *
 * Lesen nur mit eingeloggter Admin-Sitzung; RLS erzwingt is_admin().
 */

type IngredientRow = {
  id: string;
  name: string;
  unit: string;
  sort_order: number;
};

export async function getBackstubeIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("backstube_ingredients")
    .select("id, name, unit, sort_order")
    .order("name")
    .returns<IngredientRow[]>();

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    unit: r.unit,
    sortOrder: r.sort_order,
  }));
}
