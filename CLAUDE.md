# CLAUDE.md — Projekt Kurvenbeck

Arbeitsanweisungen für Claude Code in diesem Projekt. Diese Datei wird zu Beginn
jeder Session gelesen.

## Projekt

Web-Präsenz für den Familienbetrieb **Kurvenbeck** mit drei Bereichen:
Biergarten, Catering, Backstube. Visuelle Richtung: Option C „Warm & Handwerklich".
Quellen: `README.md` (Handoff) + `kurvenbeck-design-guide Kopie.md` (Design-Tokens,
Single Source of Truth). Die `*.html`-Dateien im Root sind **Design-Referenzen**,
kein auszuliefernder Code.

Die lauffähige App liegt unter **`web/`** (Next.js App Router, TypeScript).

**Einstieg/Übergabe:** `HANDOFF.md` (Root) bündelt Stand, Setup, Struktur und
nächste Schritte — bei größeren Änderungen am Projektstand dort mitpflegen.

## Sprache & Anrede (verbindlich)

- Sämtliche **nutzersichtbaren Texte sind auf Deutsch**.
- **Anrede durchgängig in der Du-Form (informell) — niemals „Sie".**
  Also `du / dein / dir / dich`, nicht `Sie / Ihr / Ihnen`.
  - „du" wird **kleingeschrieben** (Default), außer am Satzanfang.
  - Beispiele:
    - ❌ „Sagen Sie uns kurz, was Sie vorhaben." → ✅ „Sag uns kurz, was du vorhast."
    - ❌ „Wir melden uns bei Ihnen." → ✅ „Wir melden uns bei dir."
    - ❌ „Ihr Fest, unser Handwerk." → ✅ „Dein Fest, unser Handwerk."
  - Gilt für **alle** Komponenten, Seiten, Formular-Labels/-Platzhalter,
    Buttons, Erfolgs-/Fehlermeldungen und Meta-Beschreibungen.
- **Schwäbischer Dialekt** nur in Headlines / Marketing-Copy (z. B. „Hock di na.",
  „Schnell sei, sonst isch's weg.") — **nie** in Formularen, Checkout oder Rechtstexten.
- **Rechtstexte** (Impressum, Datenschutz, AGB) dürfen sachlich-neutral formuliert
  sein; wo eine Anrede vorkommt, ebenfalls Du-Form.
- **Geschützte Berufs-/Betriebsbezeichnungen (verbindlich):** Der Betrieb ist eine
  **Backstube**, **keine „Bäckerei"**, und der Betreiber ist **kein gelernter „Bäcker"**
  (kein Ausbildungs-/Meistertitel). Daher in **allen** Texten, Labels, Alt-Texten und
  Meta-Beschreibungen die Wörter **„Bäcker" und „Bäckerei" vermeiden**. Stattdessen:
  „Backstube", „aus dem Ofen", „von Hand geformt/gebacken", und für die Person
  „der Betreiber / die Familie / das Team / Kurvenbeck".
- **„seit 1978" wird nicht beworben (Entscheidung 2026-07-06, endgültig):** die Backstube
  existiert erst ~1,5 Jahre, die Jahreszahl würde den Gesamtbetrieb falsch darstellen.
  Jede Erwähnung von „1978"/„seit 1978" — Meta-Beschreibungen, Copy, Design-Referenzen —
  ist entfernt und darf **nicht** wieder eingeführt werden.

## Design

- Alle Maße, Farben, Typo, Abstände kommen aus den Tokens
  (`web/app/globals.css`, gespiegelt aus `assets/tokens.css` + Design-Guide).
  Keine „magischen" Werte — immer die `--token`-Variablen verwenden.
- High-Fidelity: pixelgenau zur Referenz.

## Bilder

- Echte Fotos als **WebP** in `web/public/images/...` (Struktur + Namen:
  `web/public/images/README.md`). Eingebunden über `<Photo>` + Registry
  `web/lib/images.ts`. Leere Slots zeigen den beschrifteten Platzhalter —
  Slot erst freischalten, wenn die Datei existiert (sonst 404).

## Kontaktdaten & Konfiguration

- Kontaktdaten (v. a. Telefonnummer) **nicht hardcoden**. Einzige Quelle:
  `web/lib/siteSettings.ts` (`siteSettings.contactPhone` + Helfer `telHref`,
  `whatsappHref`). Footer und Biergarten-CTAs lesen daraus.
- ⚠️ **Die aktuelle Telefonnummer ist ein Platzhalter** (`07071 / 12 34 56`) und
  **darf so nicht live gehen** — vorher durch die echte Nummer ersetzen bzw. aus
  dem Backend laden.
- **Geplant (beschlossen 2026-07-05):** Kontaktdaten (Telefon + Adresse) und
  **Öffnungszeiten** in Supabase, vom Betreiber selbst im Admin pflegbar —
  Telefon/Adresse über `site_settings`, Öffnungszeiten über eine Termin-Tabelle
  (`opening_days`: Datum + Uhrzeit von–bis, Besenwirtschaft-Modell). Details/Schritte:
  `web/TODO.md` #1. Öffnungszeiten sind **nicht** „immer Sa/So", sondern konkrete Tage.
- `wa.me`-Nummern brauchen internationales Format ohne führende Null; der
  Helfer leitet das aus `e164` ab.
- **E-Mail-Versand (beschlossen 2026-07-05, live seit 2026-07-06):** transaktionale
  Mails laufen über **SMTP des bestehenden Postfachs `kontakt@kurvenbeck.com` bei
  Hostinger** („Weg B", `smtp.hostinger.com:465`). SMTP-Zugangsdaten liegen in
  `web/.env.local` (git-ignoriert) — **nie committen**. Zentraler Helper
  `web/lib/mail.ts` (`nodemailer`): `sendNotificationMail()` an euch selbst
  (`kontakt@kurvenbeck.com`) und `sendMailTo()` an einen beliebigen Empfänger (z. B.
  Gast-Bestätigung). Absendername ist bewusst **„Kurvenbeck Homepage"** (zentral im
  Helper gesetzt) — **jede neue Mail-Funktion muss über diesen Helper laufen**, nicht
  eigene Transporter aufbauen, damit der Absendername überall konsistent bleibt.
  Schlägt der Versand fehl oder ist SMTP nicht konfiguriert, wird nur geloggt — der
  eigentliche Speichervorgang (z. B. Supabase-Insert) darf nie davon abhängen.
  **Catering-Formular** verschickt bereits beide Mails (Admin-Benachrichtigung +
  Gast-Bestätigung „Wir haben deine Anfrage erhalten"). **Backstube-Bestätigung an
  den Gast ist technisch nicht mehr blockiert (SMTP steht), aber noch nicht gebaut**
  — offen in `web/TODO.md` #3.

## Supabase & Menü-Backend

Das Speise-/Getränke-Menü liegt in **Supabase** (Projekt `dbzxowlgmwnytanfnzdb`).
Verbindliche Spezifikation + Stand: `HANDOFF.md` §10 und `web/plans/biergarten-menu-backend.md`.
Dauerhafte Konventionen:

- **Clients:** `@supabase/ssr` in `web/utils/supabase/` (`client.ts` Browser,
  `server.ts` async `cookies()`, `middleware.ts` Session-Refresh). Env in
  `web/.env.local` (git-ignoriert): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Sicherheit:** öffentliches Lesen über Publishable-Key + RLS; Schreiben **nur**
  über Server Actions mit eingeloggter Sitzung (RLS-Check `auth.email()` in Tabelle
  `admins`). **Nie** den `service_role`/Secret-Key in die App legen.
- **Schema-Änderungen:** immer als SQL-Migration in `web/supabase/migrations/`
  ablegen (versioniert), nie nur direkt auf der DB.
- **Menüs ohne Produktfotos** — Biergarten **und** Backstube: reines Text-Format
  (`.menu-item`). Kein `photo`-Feld im Menü-Schema.
- **Backstube-Rezepte & Zutaten-Stammdaten (2026-07-07):** Jede Backware kann bis zu
  **10 Zutaten** (Rezept) bekommen. Verbindliche Architektur: **eine Source of Truth** —
  die Backware wird **nur in der Speisekarte** (`/admin?area=backstube`, `MenuAdmin`)
  angelegt/bepreist/verfügbar geschaltet; das Rezept hängt direkt im selben `ItemEditor`.
  **Kein zweiter Anlege-Ort.** Zutaten sind **zentrale Stammdaten**
  (Tabelle `backstube_ingredients`, Name **case-insensitive eindeutig** + feste Einheit),
  die der Betreiber oben im Backstube-Tab pflegt und pro Rezept nur noch **auswählt**
  (Dropdown) — nie Freitext, damit die Aggregation über die Zutat-ID läuft und „Wasser"
  nicht doppelt entsteht. Rezept-Zeilen in `menu_item_ingredients`
  (`menu_item_id`→`ingredient_id`+`amount`). Migration
  `20260707100000_backstube_recipes_schema.sql`. **RLS: nur Admin** (Lesen **und**
  Schreiben) — Rezeptmengen sind interne Betriebsdaten, **kein** öffentliches Lesen
  (anon/Publishable-Key sieht diese Tabellen nie). Der Zutaten-Bedarf wird **live** aus
  dem aktuellen Rezept × Bestellmenge gerechnet (nicht im Bestell-Snapshot eingefroren —
  gebacken wird mit dem heutigen Rezept). Client-sichere Typen/Helfer in `lib/ingredients.ts`,
  Server-Loader in `lib/getIngredients.ts` (Split wie `backtag.ts`↔`getBacktag.ts`, sonst
  bricht der Client-Import).
- **Admin `/admin/bestellungen` = 3 Unter-Reiter** (`BestellungenTabs`, Client):
  **Backtag** (Backtag pflegen) · **Backliste & Zutaten** (was zu backen ist + je Backware
  hochgerechnete Zutaten + Gesamt-Einkaufsliste des Tages, mit Drucken-Button) ·
  **Bestellungen** (Einzelbestellungen mit Namens-Suche). Bestellungen sind **offen oben,
  erledigt unten** sortiert (JS-Sort in `getBackstubeOrders`; Abhaken schiebt via
  `revalidatePath` live nach unten).
- **Allergene:** deutsches LMIV-Buchstaben-Schema (A–R) als Stammdaten; Anzeige als
  Codes am Gericht + Legende der verwendeten Allergene. Tags nur
  `vegetarisch` / `vegan` / `alkoholfrei`.
- **Rendering:** dynamisch (SSR), damit Änderungen des Kunden sofort live sind.
- **Admin & Auth:** Verwaltung unter `/admin` (passwortloser Magic-Link-Login über
  `/admin/login`, Confirm-Route `/auth/confirm`). Route-Schutz in
  `utils/supabase/middleware.ts`. `@supabase/ssr` nutzt den **PKCE-Flow** → das
  Supabase-Magic-Link-Template muss den token_hash-Link verwenden
  (`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`).
  Auth-Konten **nie** manuell per SQL in `auth.users` anlegen (GoTrue braucht leere
  Strings statt NULL in den Token-Spalten) — Dashboard → Authentication → Users nutzen.
  Details/Stand: `kurvenbeck-admin-auth`-Memory + `HANDOFF.md` §10.

## Datenschutz & Hosting

- **Hoster (beschlossen 2026-07-06): Vercel.** Deployment selbst steht noch aus
  (siehe `HANDOFF.md` §9).
- **Datenschutzerklärung ist live** (`web/app/datenschutz/page.tsx`, echter Text seit
  2026-07-06) — nennt Vercel + Supabase als Auftragsverarbeiter, beschreibt
  Catering-Anfrage und Backstube-Vorbestellung als eigene Verarbeitungsvorgänge inkl.
  Löschfristen sowie den Supabase-Admin-Login-Cookie und den `localStorage`-Warenkorb.
  **Impressum + AGB sind noch Platzhalter** und müssen die dort hinterlegten echten
  Verantwortlicher-Angaben übernehmen (Name, Anschrift, `kontakt@kurvenbeck.com`) —
  sonst widersprechen sich die Rechtsseiten.
- **Löschfristen für Formulardaten (beschlossen 2026-07-06), automatisiert per
  `pg_cron`:**
  - **Catering-Anfragen** (`catering_requests`): 60 Tage nach `event_date`
    (Wunschdatum; Fallback `created_at`, falls kein Datum angegeben wurde).
  - **Backstube-Vorbestellungen** (`backstube_orders`): 7 Tage nach `backtag_date`
    (Fallback `created_at`).
  - Jobs `delete-old-catering-requests` / `delete-old-backstube-orders`, Migration
    `20260706150000_retention_cron_jobs.sql`. Bei neuen personenbezogenen
    Formulardaten immer eine passende Löschfrist + Cron-Job mitdenken, nicht nur die
    generischen handels-/steuerrechtlichen Fristen aus der Datenschutzerklärung
    anwenden — die gelten nur für tatsächliche Buchhaltungsunterlagen.
- **Keine Tracking-/Analyse-/Marketing-Cookies.** Es werden nur zwei technisch
  notwendige Speichervorgänge eingesetzt (Supabase-Admin-Login-Cookie,
  `localStorage`-Warenkorb der Backstube) — beide brauchen laut § 25 Abs. 2 Nr. 2
  TTDSG keine Einwilligung. **Kein Cookie-Banner einbauen**, solange das so bleibt.
  Sollte je Analytics (z. B. Google Analytics) oder Marketing-Tracking dazukommen,
  ändert sich das grundlegend (Consent-Banner + Anpassung der
  Datenschutzerklärung nötig) — vorher mit dem Kunden abstimmen.

## Icons

- Icon-Set: **`@tabler/icons-react`** (tree-shakeable). Beispiel:
  `import { IconPhone, IconBrandWhatsapp } from "@tabler/icons-react"` →
  `<IconPhone size={18} stroke={1.75} aria-hidden />`. In Buttons sorgt die
  `.btn`-Klasse (`gap`) für den Abstand.

## Offene Aufgaben

Siehe `web/TODO.md` (Supabase-Anbindung, echte Fotos/Logo, Formular-/Bestell-
Backend usw.).

## Befehle (im Ordner `web/`)

```bash
npm run dev      # Dev-Server (http://localhost:3003)
npm run build    # Production-Build inkl. Typecheck + Lint
npm start        # Production-Server (http://localhost:3003)
```

**Port verbindlich: 3003.** Die Kurvenbeck-Seite läuft lokal immer über
`http://localhost:3003` (in `web/package.json` per `-p 3003` fest verdrahtet,
nicht der Next.js-Default 3000) — Screenshots, Tests und Browser-Checks immer
gegen diesen Port fahren.

⚠️ **`npm run build` nie parallel zu einem laufenden `npm run dev` ausführen** —
beide teilen sich den `.next`-Ordner; ein Production-Build während der Dev-Server
läuft, zerschießt dessen Chunks/Manifeste (sichtbares Symptom: Layout „springt",
CSS wirkt kaputt, obwohl der Code korrekt ist). Für reine Typecheck-Zwecke
stattdessen `npx tsc --noEmit` nutzen; falls doch gebaut werden muss, den
Dev-Server vorher stoppen bzw. hinterher mit gelöschtem `.next` neu starten.

## Konventionen

- App Router, TypeScript. Interaktive Teile sind Client-Komponenten
  (`"use client"`): `SiteHeader`, `CartContext`/Warenkorb, `CateringForm`.
- Gemeinsame Bausteine in `web/components/`, Daten/Helfer in `web/lib/`.
- Vor dem Abschluss einer Aufgabe `npm run build` grün halten.
