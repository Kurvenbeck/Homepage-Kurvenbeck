-- Seed: Admin-Allowlist, 14 EU-Allergene (LMIV), Biergarten-Karte 1:1 aus
-- app/biergarten/page.tsx (Stand vor DB-Umstellung). Einmalig auszuführen.

insert into public.admins (email) values
  ('kontakt@kurvenbeck.com'),
  ('ihringmichael@gmail.com')
on conflict do nothing;

insert into public.allergens (code, label, sort_order) values
  ('A', 'Glutenhaltiges Getreide', 1),
  ('B', 'Krebstiere',              2),
  ('C', 'Eier',                    3),
  ('D', 'Fisch',                   4),
  ('E', 'Erdnüsse',                5),
  ('F', 'Soja',                    6),
  ('G', 'Milch/Laktose',           7),
  ('H', 'Schalenfrüchte',          8),
  ('L', 'Sellerie',                9),
  ('M', 'Senf',                   10),
  ('N', 'Sesam',                  11),
  ('O', 'Sulfite',                12),
  ('P', 'Lupinen',                13),
  ('R', 'Weichtiere',             14)
on conflict (code) do nothing;

with vesper as (
  insert into public.menu_categories (area, title, sort_order)
  values ('biergarten', 'Vesper & Warmes', 0)
  returning id
),
getraenke as (
  insert into public.menu_categories (area, title, sort_order)
  values ('biergarten', 'Getränke', 1)
  returning id
)
insert into public.menu_items (category_id, name, description, price, sort_order, tags)
values
  ((select id from vesper),    'Original Kurvenbeck-Brezel', 'mit guter Butter, frisch aus der eigenen Backstube', 3.80, 0, '{}'),
  ((select id from vesper),    'Schwäbischer Wurstsalat',    'mit Bauernbrot & Röstzwiebeln',                     9.50, 1, '{}'),
  ((select id from vesper),    'Maultaschen in der Brühe',   'hausgemacht, mit Schnittlauch',                    11.80, 2, '{}'),
  ((select id from vesper),    'Käsespätzle',                'mit Bergkäse & gerösteten Zwiebeln',               12.90, 3, '{vegetarisch}'),
  ((select id from vesper),    'Schnitzel mit Pommes',       'vom Schwein, mit Zitrone & Preiselbeeren',         15.80, 4, '{}'),
  ((select id from vesper),    'Große Vesperplatte',         'Wurst, Käse, Brezel, Gewürzgurke — zum Teilen',    16.50, 5, '{}'),
  ((select id from getraenke), 'Helles vom Fass',            '0,5 l, frisch gezapft',                             4.40, 0, '{}'),
  ((select id from getraenke), 'Naturtrübes Radler',         '0,5 l',                                             4.20, 1, '{}'),
  ((select id from getraenke), 'Weizenbier',                 'hell oder dunkel, 0,5 l',                           4.60, 2, '{}'),
  ((select id from getraenke), 'Apfelschorle',               'vom Streuobst, 0,4 l',                              3.60, 3, '{}'),
  ((select id from getraenke), 'Trollinger im Viertele',     '0,25 l, vom Weingut nebenan',                       5.20, 4, '{}'),
  ((select id from getraenke), 'Hausgemachte Limonade',      'Holunder oder Zitrone, 0,4 l',                      3.80, 5, '{alkoholfrei}');
