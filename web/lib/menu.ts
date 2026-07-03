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
  tags: string[];
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
    tags: string[] | null;
    sort_order: number;
    is_available: boolean;
    menu_item_allergens: { allergen_code: string }[];
  }[];
};

// ---------------------------------------------------------------------------
// Admin-Sicht: alle Gerichte (auch nicht verfügbare), roher Preis zum Editieren.
// ---------------------------------------------------------------------------

export type AdminMenuItem = {
  id: string;
  name: string;
  description: string | null;
  /** Preis als deutsches Eingabeformat, z. B. "12,90". */
  price: string;
  tags: string[];
  isAvailable: boolean;
  allergens: string[];
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
             id, name, description, price, tags, sort_order, is_available,
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

  const mappedCategories: AdminMenuCategory[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    title: cat.title,
    sortOrder: cat.sort_order,
    items: cat.menu_items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: formatPrice(item.price),
      tags: item.tags ?? [],
      isAvailable: item.is_available,
      allergens: item.menu_item_allergens
        .map((a) => a.allergen_code)
        .sort((a, b) => a.localeCompare(b)),
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
             id, name, description, price, tags, sort_order, is_available,
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

  const mappedCategories: MenuCategory[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    title: cat.title,
    items: cat.menu_items
      .filter((item) => item.is_available)
      .map((item) => {
        const codes = item.menu_item_allergens
          .map((a) => a.allergen_code)
          .sort((a, b) => a.localeCompare(b));
        codes.forEach((c) => usedCodes.add(c));
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: formatPrice(item.price),
          tags: item.tags ?? [],
          allergens: codes,
        };
      }),
  }));

  const legend = (allergens ?? [])
    .filter((a) => usedCodes.has(a.code))
    .map((a) => ({ code: a.code, label: a.label }));

  return { categories: mappedCategories, legend };
}
