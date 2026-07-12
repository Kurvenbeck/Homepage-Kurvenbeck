-- Getränke: optionale zweite Größe (z. B. 0,2 l / 0,4 l) mit eigenem Preis,
-- statt jede Größe als eigenen Menüeintrag anzulegen. Bestehende `price`-
-- Spalte bleibt der Basis-/erste-Größe-Preis. Alle drei Spalten nullable —
-- keine Datenmigration nötig, bestehende RLS-Policies auf menu_items decken
-- neue Spalten automatisch ab.

alter table public.menu_items
  add column size1_label text,
  add column size2_label text,
  add column size2_price numeric(6,2);
