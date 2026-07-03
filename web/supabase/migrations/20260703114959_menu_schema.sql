-- Biergarten-Menü-Backend: Schema + RLS
-- Generisch (area-Spalte), damit Backstube/Catering später andocken.
-- Sicherheitsmodell: öffentliches Lesen (anon) + Schreiben nur für Admins
-- (E-Mail in public.admins). Kein service_role in der App.

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.admins (
  email text primary key
);

create table public.menu_categories (
  id         uuid primary key default gen_random_uuid(),
  area       text not null,
  title      text not null,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.menu_categories(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(6,2) not null,
  is_available boolean not null default true,
  sort_order   int not null default 0,
  tags         text[] not null default '{}',  -- 'vegetarisch' | 'vegan' | 'alkoholfrei'
  created_at   timestamptz not null default now()
);

create table public.allergens (
  code       text primary key,   -- deutsches LMIV-Schema: A, B, C, D, E, F, G, H, L, M, N, O, P, R
  label      text not null,
  sort_order int  not null default 0
);

create table public.menu_item_allergens (
  menu_item_id  uuid not null references public.menu_items(id) on delete cascade,
  allergen_code text not null references public.allergens(code) on delete restrict,
  primary key (menu_item_id, allergen_code)
);

create index menu_items_category_id_idx     on public.menu_items (category_id);
create index menu_categories_area_idx       on public.menu_categories (area);
create index menu_item_allergens_code_idx   on public.menu_item_allergens (allergen_code);

-- ---------------------------------------------------------------------------
-- Rollen-Grants (RLS regelt zusätzlich die Zeilen-Sichtbarkeit)
-- ---------------------------------------------------------------------------

grant select on public.menu_categories, public.menu_items, public.allergens,
  public.menu_item_allergens to anon, authenticated;
grant insert, update, delete on public.menu_categories, public.menu_items,
  public.allergens, public.menu_item_allergens to authenticated;
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- Admin-Check: darf nur die eigene Zeile in admins sehen (Least Privilege),
-- damit is_admin() als SECURITY INVOKER greift, ohne admins offenzulegen.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where email = (select auth.email())
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS aktivieren
-- ---------------------------------------------------------------------------

alter table public.admins              enable row level security;
alter table public.menu_categories     enable row level security;
alter table public.menu_items          enable row level security;
alter table public.allergens           enable row level security;
alter table public.menu_item_allergens enable row level security;

-- admins: eingeloggter Nutzer sieht ausschließlich seine eigene Zeile
create policy "admins_select_own" on public.admins
  for select to authenticated
  using (email = (select auth.email()));

-- Öffentliches Lesen der Menü-Daten (anon + authenticated)
create policy "menu_categories_public_read" on public.menu_categories
  for select to anon, authenticated using (true);
create policy "menu_items_public_read" on public.menu_items
  for select to anon, authenticated using (true);
create policy "allergens_public_read" on public.allergens
  for select to anon, authenticated using (true);
create policy "menu_item_allergens_public_read" on public.menu_item_allergens
  for select to anon, authenticated using (true);

-- Schreiben nur für Admins (INSERT/UPDATE/DELETE)
create policy "menu_categories_admin_write" on public.menu_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "menu_items_admin_write" on public.menu_items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "allergens_admin_write" on public.allergens
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "menu_item_allergens_admin_write" on public.menu_item_allergens
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
