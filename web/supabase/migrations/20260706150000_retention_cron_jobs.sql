-- Automatische Löschung nach den in der Datenschutzerklärung zugesagten Fristen:
--   * Catering-Anfragen: 60 Tage nach Wunschdatum (Fallback: Eingangsdatum, falls
--     kein Wunschdatum angegeben wurde).
--   * Backstube-Vorbestellungen: 7 Tage nach dem jeweiligen Backtag (Fallback:
--     Eingangsdatum, falls kein Backtag-Datum gesetzt ist).
-- Läuft täglich nachts über pg_cron; kein externer Scheduler nötig.
-- cron.schedule() ist idempotent: ein bereits vorhandener Job gleichen Namens wird
-- aktualisiert statt dupliziert.

create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-catering-requests',
  '0 3 * * *',
  $$
  delete from public.catering_requests
  where coalesce(event_date, created_at::date) < (current_date - interval '60 days')
  $$
);

select cron.schedule(
  'delete-old-backstube-orders',
  '15 3 * * *',
  $$
  delete from public.backstube_orders
  where coalesce(backtag_date, created_at::date) < (current_date - interval '7 days')
  $$
);
