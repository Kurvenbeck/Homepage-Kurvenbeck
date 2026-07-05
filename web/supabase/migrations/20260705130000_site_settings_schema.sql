-- Seiten-Einstellungen (Kontaktdaten): key/value, vom Betreiber im Admin pflegbar.
-- Ersetzt die hartkodierte Platzhalter-Telefonnummer in lib/siteSettings.ts.
-- Sicherheitsmodell wie Menü/Öffnungszeiten: öffentlich lesbar, Schreiben nur Admin
-- (is_admin() gegen public.admins). Kein service_role in der App.

create table public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

alter table public.site_settings enable row level security;

create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

create policy "site_settings_admin_write" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Startwerte = bisherige Platzhalter, damit die Seite unverändert weiterläuft,
-- bis der Betreiber die echten Daten im Admin einträgt.
insert into public.site_settings (key, value) values
  ('contact_phone_display', '07071 / 12 34 56'),
  ('contact_phone_e164',    '+4970711234560'),
  ('contact_address',       E'Mühlweg 12\n72074 Musterstadt');
