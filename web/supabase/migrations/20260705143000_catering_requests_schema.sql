-- Catering-Anfragen aus dem Kontaktformular. Sicherheitsmodell abweichend vom Menü:
--   * Öffentliche Besucher dürfen NUR EINFÜGEN (anonymes Absenden des Formulars).
--   * LESEN/ÄNDERN nur Admins (is_admin()) — die Anfragen enthalten Namen/E-Mails
--     und dürfen niemals öffentlich lesbar sein.
-- Server-seitige Validierung passiert zusätzlich in der Server Action.

create table public.catering_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  occasion   text,
  guests     integer,
  event_date date,
  message    text,
  status     text not null default 'neu' check (status in ('neu', 'erledigt')),
  created_at timestamptz not null default now()
);

create index catering_requests_status_created_idx
  on public.catering_requests (status, created_at desc);

-- Nur INSERT für anon (Formular); Lesen/Ändern für eingeloggte Admins.
grant insert on public.catering_requests to anon, authenticated;
grant select, update on public.catering_requests to authenticated;

alter table public.catering_requests enable row level security;

-- Öffentliches Einfügen erlaubt (Validierung serverseitig); kein Rücklesen für anon.
create policy "catering_requests_public_insert" on public.catering_requests
  for insert to anon, authenticated with check (true);

create policy "catering_requests_admin_read" on public.catering_requests
  for select to authenticated using (public.is_admin());

create policy "catering_requests_admin_update" on public.catering_requests
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
