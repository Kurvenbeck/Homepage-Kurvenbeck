-- „Empfehlung des Hauses": Flag an einem Menü-Eintrag. Ein markierter Eintrag wird
-- auf der Bereichsseite oben hervorgehoben und aus der normalen Kategorieliste
-- herausgenommen (z. B. spontaner Schweinebraten, der sonst nicht auf der Karte steht).
-- Im Admin ein-/ausschaltbar. Gilt generisch für alle Bereiche (Biergarten/Backstube).

alter table public.menu_items
  add column is_recommendation boolean not null default false;
