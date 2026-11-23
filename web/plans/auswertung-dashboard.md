# Auswertung / Dashboard für den Betreiber (Plan, Stand 2026-11-22)

Beschlossen im Gespräch am 2026-11-22. Eigener Admin-Menüpunkt **„Auswertung"**
(`/admin/auswertung`, Eintrag in `AdminNav`).

## Umfang

Umgesetzt werden:

| # | Auswertung | Quelle |
|---|---|---|
| 1 | Nächster Backtag auf einen Blick (Stückzahlen, Einkaufsliste, Bestellschluss-Countdown, offene Bestellungen) | live: `getBackstubeOrders` + Backtag |
| 2 | Umsatz pro Backtag (Verlauf, Vergleich Vorbacktag/Durchschnitt) | `backtag_stats_day` |
| 3 | Bestseller & Ladenhüter | `backtag_stats_item` |
| 4 | Wareneinsatz & Marge pro Backware | `backtag_stats_item.cost` + Zutaten-Einkaufspreis |
| 6 | Bestellverlauf bis Bestellschluss (Tage/Stunden vorher) | `backtag_stats_day.lead_days` |
| 7 | Durchschnittlicher Warenkorb (Euro, Stück) | `backtag_stats_day` |
| 8 | Abholquote / Nicht-Abholer | Status „nicht abgeholt" |
| 9 | Zutaten-Verbrauch & Einkaufskosten pro Monat | `backtag_stats_item` × Rezept/Preis |
| 10 | Wochentag- & Saisonmuster | `backtag_stats_day` |
| 11 | Prognose nächster Backtag | Historie + aktuelles Bestelltempo |
| 13 | Zusammen bestellt (Warenkorb-Analyse) | `backtag_stats_pair` |
| 14 | Catering-Pipeline | `catering_requests` (live) + Monatsaggregat |
| 15 | Wochenlast-Kalender (Backtage, Öffnungstage, Catering) | `opening_days`, Backtag, Catering |
| 16 | Tageszeit-Heatmap (Wochentag × Uhrzeit) | `backtag_stats_day.hours` |
| 17 | Ernährungsnachfrage (vegan/vegetarisch/Allergene) | `backtag_stats_item` + Tags |
| 18 | Preisänderungs-Wirkung | `menu_item_price_history` |
| + | Was-wäre-wenn-Rechner (Preis ± → Monatseffekt) | Preis, Absatz, Kosten |
| + | Wetter-Korrelation | Open-Meteo (täglich) × Umsatz |
| + | Jahresrückblick | Jahresaggregat aus `backtag_stats_*` |

Gestrichen: 5 (Überproduktion), 12 (Kapazität), 19 (Stammkunden, personenbezogen),
20 (Website-Reichweite, würde Datenschutzerklärung/Cookie-Lage ändern).

## Fundament: anonyme Statistik vor der Löschung

`backstube_orders` wird 7 Tage nach dem Backtag gelöscht (Cron `delete-old-backstube-orders`).
Damit Verläufe möglich sind, schreibt vorher ein Job **anonyme Aggregate** — ohne Name,
E-Mail, Telefon, Notiz. Anonyme Aggregate fallen nicht unter die Löschpflicht.

Neue Migration `web/supabase/migrations/2026…_auswertung_stats.sql`:

- `backtag_stats_day` — `backtag_date` (PK), `orders_count`, `items_count`, `revenue`,
  `orders_done`, `orders_not_picked_up`, `hours` (jsonb 0–23), `lead_days` (jsonb).
- `backtag_stats_item` — (`backtag_date`, `menu_item_id`, `name`) → `qty`, `revenue`,
  `cost` (Wareneinsatz, beim Snapshot eingefroren), Diet-Tags.
- `backtag_stats_pair` — (`backtag_date`, `item_a`, `item_b`) → `count`.
- `menu_item_price_history` — Trigger auf `menu_items.price`; Start-Eintrag = aktueller Preis.
- `backstube_ingredients.price_per_base` (Einkaufspreis; UI fragt „Preis pro kg/l/Stück"
  und rechnet auf die Basiseinheit der Zutat um).
- `backstube_orders.status` erweitern um `nicht_abgeholt`.
- `weather_daily` (Datum, Temp max, Niederschlag, Sonnenstunden) — nur Betriebsstandort.
- Funktion `snapshot_backstube_orders()` (security definer, idempotent, überschreibt pro
  Backtag mit dem vollständigen Stand) + Cron-Job **vor** dem Löschjob (z. B. 03:05,
  Löschung läuft 03:15). Läuft für alle vergangenen Backtage, die noch Bestellungen haben.
- RLS: alle neuen Tabellen **nur Admin** (lesen), Schreiben nur über die Funktion; kein anon.

Hinweis: Bestellungen, die schon gelöscht sind, fehlen für immer. Die Historie beginnt mit
dem ersten Lauf (+ den Bestellungen der letzten 7 Tage). Je früher die Migration live ist,
desto mehr Verlauf entsteht.

## Umsetzung

- Server-Loader `lib/getAuswertung.ts`, client-sichere Typen/Helfer in `lib/auswertung.ts`
  (Split wie `backtag.ts`↔`getBacktag.ts`).
- Seite `app/admin/auswertung/page.tsx` (dynamic, Admin-Check wie `bestellungen`).
- Diagramme als **eigene SVG-Komponenten** (`components/admin/auswertung/`), keine neue
  Chart-Bibliothek (weniger Abhängigkeiten, Dependabot-Aufwand). Nur Design-Tokens.
- Wetter: Server-Abruf Open-Meteo (Archiv + Vorhersage) per Cron/Route, ohne
  personenbezogene Daten.
- Alle Texte Du-Form, kein „Bäcker/Bäckerei".

## Phasen

1. **Fundament:** Migration + Snapshot-Job + Datenschutz-Satz + Seite mit #1, 2, 3, 7, 14, 15.
2. **Verlauf:** #6, 10, 16, 17, 13 (brauchen Historie, Diagramme).
3. **Kosten/Status/Preis:** Einkaufspreis-Feld, „nicht abgeholt"-Button, Preis-Historie → #4, 8, 9, 18.
4. **Schlau:** #11 Prognose, Was-wäre-wenn, Wetter, Jahresrückblick.

Jede Phase: eigener Worktree, `tsc` + `build` grün, lokal klicken, erst nach Freigabe pushen.
Nicht deployen, während eine Bestellaktion läuft.

## Entschieden (2026-11-22)

1. **Wetter × Biergarten:** Der Betreiber trägt pro Öffnungstag die Gästezahl ein (ein Feld an
   `opening_days`, Eingabe-Karte in „Vorausschau"). Wetter-Korrelation gilt für Biergarten **und** Backstube.
2. **Nicht abgeholt:** eigener Button „Nicht abgeholt" an der Bestellung (Status `nicht_abgeholt`).
3. **Datenschutz:** Ein Satz in `web/app/datenschutz/page.tsx` zu anonymen Statistiken (kommt mit Phase 1).

## Prototyp (Stand 2026-11-22)

Branch `auswertung-prototyp` (Worktree `../Kurvenbeck-auswertung`), Route `/auswertung-prototyp`
mit **Beispieldaten** (`lib/auswertungMock.ts`, deterministisch). 7 Tabs: Überblick · Backwaren · Verlauf ·
Geld · Kalender · Vorausschau · Jahresrückblick. Eigene SVG-Diagramme in `components/admin/auswertung/`.
Beim Umbau auf echte Daten: `buildMockData()` durch Loader auf `backtag_stats_*` ersetzen, Route nach
`/admin/auswertung` verschieben (Admin-Check), `AdminNav` um „Auswertung" erweitern.
Nebenbei: `next.config.mjs` erlaubt im **Dev-Modus** `unsafe-eval` + WebSocket (sonst hydriert keine Seite
unter der CSP); Production-Header unverändert.
