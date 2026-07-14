-- Kategorien lassen sich jetzt komplett aus-/einblenden (analog zu
-- menu_items.is_available), unabhängig vom Verfügbar-Status der einzelnen
-- Einträge darin. Default true, damit bestehende Kategorien unverändert
-- sichtbar bleiben. Bestehende RLS-Policies auf menu_categories decken die
-- neue Spalte automatisch ab (kein Policy-Update nötig).

alter table public.menu_categories
  add column is_available boolean not null default true;
