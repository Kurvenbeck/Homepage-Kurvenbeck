-- Seed: Backstube-Sortiment (area = 'backstube') als Text-Menü — 1:1 aus dem
-- bisherigen statischen `web/lib/products.ts`. Keine Produktfotos (Text-Format),
-- keine Tags/Allergene vorbelegt: die pflegt der Kunde bewusst selbst im Admin
-- (Allergen-Angaben sind rechtlich sensibel → nichts erfinden).
-- Idempotent: läuft nur, wenn noch keine Backstube-Kategorien existieren.

do $$
declare
  cat_laugen uuid;
  cat_brot   uuid;
begin
  if exists (select 1 from public.menu_categories where area = 'backstube') then
    return;
  end if;

  insert into public.menu_categories (area, title, sort_order)
  values ('backstube', 'Laugengebäck & Brötchen', 0)
  returning id into cat_laugen;

  insert into public.menu_categories (area, title, sort_order)
  values ('backstube', 'Brot & Süßes', 1)
  returning id into cat_brot;

  insert into public.menu_items (category_id, name, description, price, sort_order, tags) values
    (cat_laugen, 'Original Brezel',  'Von Hand geschlungen, laugengebadet, mit grobem Salz. Außen knusprig, innen weich.',                1.20, 0, '{}'),
    (cat_laugen, 'Briegl',           'Das schwäbische Brötchen schlechthin — rustikale Kruste, lockere Krume. Paarweise gebacken.',        0.95, 1, '{}'),
    (cat_laugen, 'Körnerwecken',     'Saftiges Brötchen mit Sonnenblumen-, Lein- und Sesamkernen. Hält lange frisch.',                     1.10, 2, '{}'),
    (cat_laugen, 'Laugenstange',     'Lange Laugenstange, ideal aufgeschnitten mit Butter oder herzhaftem Belag.',                        1.40, 3, '{}'),
    (cat_brot,   'Bauernbrot',       'Kräftiges Mischbrot aus dem Steinofen, lange Teigführung. Halber oder ganzer Laib.',                4.80, 0, '{}'),
    (cat_brot,   'Sonntagszopf',     'Buttriger Hefezopf mit Hagelzucker — der Klassiker fürs Wochenend-Frühstück. Nur samstags.',        3.60, 1, '{}');
end $$;
