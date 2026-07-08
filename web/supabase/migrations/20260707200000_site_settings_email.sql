-- Kontakt-E-Mail als pflegbare Einstellung (site_settings). Ersetzt die bisher
-- hartkodierte Adresse im Footer (lib/SiteFooter.tsx). Sicherheitsmodell unverändert:
-- öffentlich lesbar, Schreiben nur Admin (is_admin()).
insert into public.site_settings (key, value) values
  ('contact_email', 'kontakt@kurvenbeck.com')
on conflict (key) do nothing;
