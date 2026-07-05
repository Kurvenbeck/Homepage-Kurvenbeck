-- Öffnungszeiten als konkrete Termine (Besenwirtschaft-Modell): pro Zeile ein
-- Öffnungstag mit Datum + Uhrzeit von/bis. Nicht „immer Sa/So", sondern echte Tage,
-- die der Betreiber im Admin pflegt. Generisch über `area` (aktuell v. a. Biergarten).
-- Sicherheitsmodell wie Menü-Tabellen: öffentlich lesbar, Schreiben nur Admin (is_admin()).

create table public.opening_days (
  id         uuid primary key default gen_random_uuid(),
  area       text not null,
  date       date not null,
  open_time  time not null,
  close_time time not null,
  note       text,
  created_at timestamptz not null default now()
);

create index opening_days_area_date_idx on public.opening_days (area, date);

grant select on public.opening_days to anon, authenticated;
grant insert, update, delete on public.opening_days to authenticated;

alter table public.opening_days enable row level security;

create policy "opening_days_public_read" on public.opening_days
  for select to anon, authenticated using (true);

create policy "opening_days_admin_write" on public.opening_days
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
