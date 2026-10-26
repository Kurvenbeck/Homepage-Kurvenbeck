-- Maschinenlesbarer Bestellschluss (Berliner Ortszeit, "yyyy-MM-ddTHH:mm").
-- Ab diesem Zeitpunkt nimmt die Backstube automatisch keine Vorbestellungen mehr an.
insert into public.site_settings (key, value) values
  ('backtag_deadline_at', '')
on conflict (key) do nothing;
