import { createClient } from "@/utils/supabase/server";

/**
 * Menü-Loader (read-only). Lädt Kategorien + Gerichte + verknüpfte Allergen-Codes
 * für einen Bereich (`area`) serverseitig über den Publishable-Key + RLS.
 * Rendering bleibt dynamisch (SSR), damit Kunden-Änderungen sofort live sind.
 */

export type MenuTag = "vegetarisch" | "vegan" | "alkoholfrei";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  /** Formatierter Preis, z. B. "12,90". */
  price: string;
  /** Numerischer Preis (Euro) für Warenkorb-Summen, z. B. 12.9. */
  priceValue: number;
  /** Label zum Basis-Preis (nur Getränke mit Größen), z. B. "0,2 l". */
  sizeLabel: string | null;
  /** Zweite Größe (nur Getränke), falls gepflegt. */
  secondSize: { label: string; price: string; priceValue: number } | null;
  tags: string[];
  /** Als „Empfehlung des Hauses" hervorgehoben. */
  isRecommendation: boolean;
  /** Allergen-Codes (LMIV, z. B. ["A", "G"]), sortiert. */
  allergens: string[];
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type Menu = {
  categories: MenuCategory[];
  /** Hervorgehobene „Empfehlungen des Hauses" (aus den Kategorien herausgelöst). */
  recommendations: MenuItem[];
  /** Legende: nur die auf der Seite tatsächlich verwendeten Allergene. */
  legend: { code: string; label: string }[];
};

/** Preis aus `numeric(6,2)` (DB liefert number/string) → deutsches Format "12,90". */
export function formatPrice(price: number | string): string {
  const value = typeof price === "string" ? Number(price) : price;
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type CategoryRow = {
  id: string;
  title: string;
  sort_order: number;
  menu_items: {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    size1_label: string | null;
    size2_label: string | null;
    size2_price: number | string | null;
    tags: string[] | null;
    sort_order: number;
    is_available: boolean;
    is_recommendation: boolean;
    menu_item_allergens: { allergen_code: string }[];
  }[];
};

// ---------------------------------------------------------------------------
// Admin-Sicht: alle Gerichte (auch nicht verfügbare), roher Preis zum Editieren.
// ---------------------------------------------------------------------------

/** Wie CategoryRow, zusätzlich mit den Rezept-Zeilen (nur Admin-Query). */
type AdminCategoryRow = {
  id: string;
  title: string;
  sort_order: number;
  menu_items: (CategoryRow["menu_items"][number] & {
    menu_item_ingredients:
      | { ingredient_id: string; amount: number | string; sort_order: number }[]
      | null;
  })[];
};

/** Eine Rezept-Zeile: welche Zutat, wie viel je 1 Stück der Backware. */
export type RecipeLine = {
  ingredientId: string;
  amount: number;
};

export type AdminMenuItem = {
  id: string;
  name: string;
  description: string | null;
  /** Preis als deutsches Eingabeformat, z. B. "12,90". */
  price: string;
  /** Label zur Basis-Größe (nur Getränke), z. B. "0,2 l". Leer = ungenutzt. */
  sizeLabel: string;
  /** Zweite Größe (nur Getränke): Label + Preis als Eingabe-Strings. Leer = ungenutzt. */
  size2Label: string;
  size2Price: string;
  tags: string[];
  isAvailable: boolean;
  isRecommendation: boolean;
  allergens: string[];
  /** Rezept (nur Backstube gepflegt): Zutat-IDs + Mengen, nach sort_order. */
  recipe: RecipeLine[];
  sortOrder: number;
};

export type AdminMenuCategory = {
  id: string;
  title: string;
  sortOrder: number;
  items: AdminMenuItem[];
};

export type AdminMenu = {
  categories: AdminMenuCategory[];
  allergens: { code: string; label: string }[];
};

export async function getMenuForAdmin(area: string): Promise<AdminMenu> {
  const supabase = await createClient();

  const [{ data: categories, error: catError }, { data: allergens, error: allError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select(
          `id, title, sort_order,
           menu_items (
             id, name, description, price, size1_label, size2_label, size2_price,
             tags, sort_order, is_available, is_recommendation,
             menu_item_allergens ( allergen_code ),
             menu_item_ingredients ( ingredient_id, amount, sort_order )
           )`,
        )
        .eq("area", area)
        .order("sort_order")
        .order("sort_order", { referencedTable: "menu_items" })
        .returns<AdminCategoryRow[]>(),
      supabase.from("allergens").select("code, label").order("sort_order"),
    ]);

  if (catError) throw catError;
  if (allError) throw allError;

  const mappedCategories: AdminMenuCategory[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    title: cat.title,
    sortOrder: cat.sort_order,
    items: cat.menu_items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: formatPrice(item.price),
      sizeLabel: item.size1_label ?? "",
      size2Label: item.size2_label ?? "",
      size2Price: item.size2_price == null ? "" : formatPrice(item.size2_price),
      tags: item.tags ?? [],
      isAvailable: item.is_available,
      isRecommendation: item.is_recommendation,
      allergens: item.menu_item_allergens
        .map((a) => a.allergen_code)
        .sort((a, b) => a.localeCompare(b)),
      recipe: (item.menu_item_ingredients ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => ({
          ingredientId: r.ingredient_id,
          amount: typeof r.amount === "string" ? Number(r.amount) : r.amount,
        })),
      sortOrder: item.sort_order,
    })),
  }));

  return {
    categories: mappedCategories,
    allergens: allergens ?? [],
  };
}

export async function getMenu(area: string): Promise<Menu> {
  const supabase = await createClient();

  const [{ data: categories, error: catError }, { data: allergens, error: allError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select(
          `id, title, sort_order,
           menu_items (
             id, name, description, price, size1_label, size2_label, size2_price,
             tags, sort_order, is_available, is_recommendation,
             menu_item_allergens ( allergen_code )
           )`,
        )
        .eq("area", area)
        .order("sort_order")
        .order("sort_order", { referencedTable: "menu_items" })
        .returns<CategoryRow[]>(),
      supabase.from("allergens").select("code, label").order("sort_order"),
    ]);

  if (catError) throw catError;
  if (allError) throw allError;

  const usedCodes = new Set<string>();
  const recommendations: MenuItem[] = [];

  const toMenuItem = (
    item: CategoryRow["menu_items"][number],
  ): MenuItem => {
    const codes = item.menu_item_allergens
      .map((a) => a.allergen_code)
      .sort((a, b) => a.localeCompare(b));
    codes.forEach((c) => usedCodes.add(c));
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: formatPrice(item.price),
      priceValue:
        typeof item.price === "string" ? Number(item.price) : item.price,
      sizeLabel: item.size1_label ?? null,
      secondSize:
        item.size2_label && item.size2_price != null
          ? {
              label: item.size2_label,
              price: formatPrice(item.size2_price),
              priceValue:
                typeof item.size2_price === "string"
                  ? Number(item.size2_price)
                  : item.size2_price,
            }
          : null,
      tags: item.tags ?? [],
      isRecommendation: item.is_recommendation,
      allergens: codes,
    };
  };

  // Empfehlungen werden aus der normalen Kategorieliste herausgelöst und oben
  // hervorgehoben (stehen „sonst nicht auf der Karte").
  const mappedCategories: MenuCategory[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    title: cat.title,
    items: cat.menu_items
      .filter((item) => item.is_available)
      .map(toMenuItem)
      .filter((item) => {
        if (item.isRecommendation) {
          recommendations.push(item);
          return false;
        }
        return true;
      }),
  }));

  const legend = (allergens ?? [])
    .filter((a) => usedCodes.has(a.code))
    .map((a) => ({ code: a.code, label: a.label }));

  return { categories: mappedCategories, recommendations, legend };
}
