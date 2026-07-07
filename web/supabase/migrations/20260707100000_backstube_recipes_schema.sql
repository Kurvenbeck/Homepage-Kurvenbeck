-- Backstube-Rezepte: Zutaten-Stammdaten + Rezept-Zeilen pro Backware.
-- Zweck: aus den Bestellmengen eines Backtags den Zutaten-Gesamtbedarf rechnen
--   (10× Brezel → x Mehl, y Wasser, z Salz …). Die Zutaten-Stammdaten sind die
--   „Source of Truth" für die Dropdowns im Speisekarte-Editor, damit Namen
--   einheitlich bleiben (kein „Wasser" vs. „Wassser").
--
-- Sicherheit: Rezeptmengen sind INTERNE Betriebsdaten — kein öffentliches Lesen.
--   LESEN/SCHREIBEN nur Admins (is_admin()), analog backstube_orders. Der
--   Publishable-/anon-Key sieht diese Tabellen nie.

-- ---------------------------------------------------------------------------
-- Zutaten-Stammdaten (zentrale Liste, die der Betreiber selbst pflegt)
-- ---------------------------------------------------------------------------

create table public.backstube_ingredients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  unit       text not null,               -- feste Einheit je Zutat: g, kg, ml, l, Stück …
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- Name eindeutig (case-insensitive), damit dieselbe Zutat nicht doppelt entsteht.
create unique index backstube_ingredients_name_key
  on public.backstube_ingredients (lower(name));

-- ---------------------------------------------------------------------------
-- Rezept-Zeilen: verknüpfen eine Backware (menu_items) mit einer Zutat + Menge
-- ---------------------------------------------------------------------------

create table public.menu_item_ingredients (
  menu_item_id  uuid          not null references public.menu_items(id) on delete cascade,
  ingredient_id uuid          not null references public.backstube_ingredients(id) on delete restrict,
  amount        numeric(10,3) not null check (amount >= 0),  -- Menge je 1 Stück der Backware
  sort_order    int           not null default 0,
  primary key (menu_item_id, ingredient_id)
);

create index menu_item_ingredients_ingredient_idx
  on public.menu_item_ingredients (ingredient_id);

-- ---------------------------------------------------------------------------
-- Grants + RLS (nur Admins, kein anon)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.backstube_ingredients to authenticated;
grant select, insert, update, delete on public.menu_item_ingredients  to authenticated;

alter table public.backstube_ingredients enable row level security;
alter table public.menu_item_ingredients enable row level security;

create policy "backstube_ingredients_admin_all" on public.backstube_ingredients
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "menu_item_ingredients_admin_all" on public.menu_item_ingredients
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
