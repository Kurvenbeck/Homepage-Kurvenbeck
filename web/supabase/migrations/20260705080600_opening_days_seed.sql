-- Beispiel-Öffnungstage für den Biergarten (heute + kommendes Wochenende), damit die
-- „Heute geöffnet"-Anzeige sofort etwas zeigt. Der Betreiber ersetzt/ergänzt sie im Admin.
-- Idempotent: nur einfügen, wenn für den Biergarten noch keine Öffnungstage existieren.

do $$
begin
  if exists (select 1 from public.opening_days where area = 'biergarten') then
    return;
  end if;

  insert into public.opening_days (area, date, open_time, close_time, note) values
    ('biergarten', date '2026-07-05', time '11:00', time '22:00', 'Beispiel — im Admin anpassen'),
    ('biergarten', date '2026-07-11', time '11:00', time '22:00', null),
    ('biergarten', date '2026-07-12', time '11:00', time '22:00', null);
end $$;
