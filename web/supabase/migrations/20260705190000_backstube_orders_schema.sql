-- Backstube-Vorbestellungen: Gäste legen Mengen in den Warenkorb und bestellen
-- für den aktuell aktiven Backtag. Sicherheitsmodell wie Catering:
--   * anon darf NUR EINFÜGEN (öffentliches Bestellen), gehärtete WITH CHECK.
--   * LESEN/ÄNDERN nur Admins (is_admin()) — Bestellungen enthalten Namen/Kontakt.
-- Positionen liegen als JSONB-Snapshot (Name + Einzelpreis zum Bestellzeitpunkt),
-- damit spätere Menü-/Preisänderungen alte Bestellungen nicht verfälschen.

create table public.backstube_orders (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email         text,
  phone         text,
  note          text,
  items         jsonb not null,
  total         numeric(8,2) not null default 0,
  backtag_date  date,
  backtag_label text,
  status        text not null default 'neu' check (status in ('neu', 'erledigt')),
  created_at    timestamptz not null default now()
);

create index backstube_orders_status_created_idx
  on public.backstube_orders (status, created_at desc);

grant insert on public.backstube_orders to anon, authenticated;
grant select, update on public.backstube_orders to authenticated;

alter table public.backstube_orders enable row level security;

-- Öffentliches Einfügen erlaubt (Validierung zusätzlich serverseitig in der
-- Server Action); kein Rücklesen für anon.
create policy "backstube_orders_public_insert" on public.backstube_orders
  for insert to anon, authenticated
  with check (
    status = 'neu'
    and char_length(customer_name) between 1 and 200
    and (email is null or (char_length(email) between 3 and 200 and position('@' in email) > 1))
    and (phone is null or char_length(phone) <= 60)
    and (note is null or char_length(note) <= 2000)
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 100
    and total >= 0 and total <= 100000
  );

create policy "backstube_orders_admin_read" on public.backstube_orders
  for select to authenticated using (public.is_admin());

create policy "backstube_orders_admin_update" on public.backstube_orders
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Aktiver Backtag als site_settings-Werte (EIN global aktiver Backtag; der
-- Betreiber setzt nach jedem Backtag den nächsten). Keine eigene Tabelle nötig.
insert into public.site_settings (key, value) values
  ('backtag_active',        'false'),
  ('backtag_date',          ''),
  ('backtag_deadline_text', 'Freitag 18 Uhr'),
  ('backtag_pickup_text',   'Samstag ab 8 Uhr')
on conflict (key) do nothing;
