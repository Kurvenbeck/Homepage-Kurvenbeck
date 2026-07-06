-- Events (z. B. Live-Musik, Sonderveranstaltungen) sind fachlich ein Öffnungstag
-- mit Spotlight: gleiche Datums-/Uhrzeit-Logik, aber zusätzlich ein Titel und ein
-- Flag, damit die Startseite sie separat hervorheben kann (Entscheidung 2026-07-06).

alter table public.opening_days
  add column is_event boolean not null default false,
  add column event_title text;
