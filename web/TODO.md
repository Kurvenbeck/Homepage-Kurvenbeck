# TODO

Offene Aufgaben für die Kurvenbeck-Web-App. Reihenfolge ≈ Priorität.

> **✅ Erledigt — Menü-Backend (Biergarten + Backstube):** Supabase komplett angebunden
> (Clients, Middleware, Schema, RLS, Seed). **Biergarten und Backstube** lesen ihre Karte
> live aus der DB (Text-Format ohne Fotos); Magic-Link-Admin unter `/admin` pflegt beide
> Bereiche über Tabs. Phasen 1–6 + Backstube-Andockung end-to-end verifiziert (2026-07-03).
> Details: `plans/biergarten-menu-backend.md` + HANDOFF.md §10.
>
> **✅ Erledigt — Admin-Feinschliff (2026-07-05):** Save-Status pro Eintrag ist jetzt
> **grün „Gespeichert" (= deckungsgleich mit der Live-Seite) ↔ rot „Speichern" (= ungespeicherte
> Änderung)** — Überblick auf einen Blick, was noch nicht live ist. Kategorie-Löschen fragt
> jetzt mit **Anzahl der betroffenen Einträge** nach. „Bäcker"-Alt-Text von der Startseite
> entfernt (Titelschutz, siehe unten).

---

## 1. Kontaktdaten & Öffnungszeiten ins Backend  ⭐ (höchste Priorität)

### 1a. Kontaktdaten (Telefon, Adresse) — ⚠️ Platzhalter darf NICHT live gehen
Aktuell steht in `web/lib/siteSettings.ts` eine **Platzhalter-Telefonnummer**
(`07071 / 12 34 56`) — würde die Seite so live gehen, ruft jeder Gast eine falsche Nummer an.
Adresse fehlt komplett. **Entscheidung: ja, Kontaktdaten kommen ins Backend** (der Betreiber
soll sie selbst pflegen).

- [x] Tabelle `site_settings` (`key`/`value`/`updated_at`) + RLS (public read, admin write via
      `is_admin()`). Migration `20260705130000_site_settings_schema.sql`, Keys `contact_phone_display`,
      `contact_phone_e164` (E.164, für `wa.me`), `contact_address`; Seed = bisherige Platzhalter.
- [x] Loader getrennt: `lib/siteSettings.ts` (client-sicher: Typen, `FALLBACK_CONTACT`,
      `buildContact` → `telHref`/`whatsappHref`) + `lib/getSiteSettings.ts` (server: `getSiteSettings()`,
      `getSiteSettingsForAdmin()`). Fallback verhindert leere `tel:`/`wa.me`-Links.
- [x] Admin-UI: Tab „Einstellungen" (`/admin/einstellungen`, `components/admin/SettingsAdmin.tsx`)
      zum Pflegen von Telefon (Anzeige + international) & Adresse; grün/rot Save; `AdminNav` erweitert.
- [x] Verbraucher umgestellt: `SiteFooter` (contact-Prop mit Fallback), Home/Biergarten/Backstube/
      Catering laden `getSiteSettings()` und reichen es durch; Biergarten-/Backstube-CTAs nutzen es.
      End-to-end verifiziert (DB-Wert → Footer + tel/wa.me). **⚠️ Echte Nummer + Adresse trägt der
      Betreiber selbst im Admin ein** — Platzhalter bleibt bis dahin.

### 1b. Öffnungszeiten (Besenwirtschaft) — konkretes Modell
Der Biergarten ist eine **Besenwirtschaft** mit **unregelmäßigen** Öffnungstagen (nicht „immer
Sa/So"). Aktuell hart im Code (`app/biergarten/page.tsx`: „Sa & So · Feiertage, 11–22 Uhr").
**Ziel:** Der Betreiber trägt im Backend konkrete Termine ein — **Wochentag + Datum + Uhrzeit
von–bis** — und die Seite zeigt daraus klar verständlich:
> „Heute, Sonntag 5. Juli, von 10–18 Uhr geöffnet." bzw. „Heute geschlossen — nächster
> Öffnungstag: …"

- [x] Tabelle `opening_days` (`id`, `area`, `date`, `open_time`, `close_time`, `note`) + RLS
      (public read, admin write via `is_admin()`). Migration `20260705080500_opening_days_schema.sql`.
- [x] Admin-UI: Öffnungstage anlegen/bearbeiten/löschen unter **`/admin/oeffnungszeiten`**
      (`components/admin/OpeningHoursAdmin.tsx`), Nav Speisekarte↔Öffnungszeiten (`AdminNav`).
- [x] Frontend: dynamisches „Heute geöffnet/geschlossen"-Badge auf der Biergarten-Seite
      (grüner Punkt = jetzt offen), de-DE-Datum, Zeitzone Europe/Berlin (`lib/openingHours.ts`).
- [ ] **Beispiel-Öffnungstage** (Seed `..._opening_days_seed.sql`, 05./11./12. Juli) durch echte
      Termine ersetzen — im Admin pflegbar.
- [x] Badge auch auf der Startseite zeigen — kompakte Pille „Heute geöffnet · 11–22 Uhr"
      in der Biergarten-Kachel (`components/OpeningStatusView.tsx`, Variante `compact`; Startseite
      jetzt `force-dynamic`). Biergarten-Seite nutzt dieselbe Komponente (Variante `full`).
- [x] **Öffnungsstatus prominent im Hero (2026-07-06):** Entscheidung — die „Ist offen?"-Frage ist
      der erste Gedanke eines Landingpage-Besuchers, daher zusätzlich **groß direkt im Hero**
      (`OpeningStatusView`, neue Variante `hero`), nicht nur in der Biergarten-Kachel weiter unten
      (Kachel-Pille bleibt zusätzlich bestehen). Zeigt Status + bis zu 3 künftige Öffnungstage als
      Kurzvorschau (`OpeningStatus.upcoming` in `lib/openingHours.ts`) — rutscht automatisch nach,
      sobald ein Tag vergangen ist. Admin kann beliebig viele Tage im Voraus anlegen (kein Limit),
      die Landingpage zeigt trotzdem nur die nächsten 3.
- [x] **Events (2026-07-06):** Öffnungstage können im Admin als „Besonderes Event" markiert werden
      (`is_event` + `event_title`, Migration `20260706100000_opening_days_event_fields.sql`) — z. B.
      Live-Musik. Fachlich ein normaler Öffnungstag (Datum/Uhrzeit), aber auf der Startseite
      zusätzlich in einem separaten, farblich abgesetzten **Event-Banner**
      (`components/EventBanner.tsx`) hervorgehoben — unabhängig davon, wie weit das Event in der
      Zukunft liegt (nicht auf die 3-Tage-Vorschau begrenzt).
- [ ] Footer zeigt bewusst **keine** Öffnungszeiten (Doppelpflege vermeiden), nur Verlinkung.

## 2. Catering-Formular echt machen (Backend + E-Mail + Posteingang)  ⭐

Gewünscht: echter Versand als **schöne E-Mail an `kontakt@kurvenbeck.com`** + Anfrage im Admin.
**Speichern + Posteingang sind gebaut (2026-07-05); nur der Mailversand fehlt (SMTP offen).**

- [x] Server Action `app/catering/actions.ts` (`submitCateringRequest`) mit **serverseitiger**
      Validierung (Client-Validierung bleibt als UX). Läuft öffentlich (anon), schreibt via RLS.
- [x] Anfrage in Supabase gespeichert (Tabelle `catering_requests`: Name, E-Mail, Anlass, Gäste,
      Wunschdatum, Nachricht, `created_at`, `status` = neu/erledigt). Migration
      `20260705143000_catering_requests_schema.sql`. **RLS:** anon **nur INSERT** (gehärtete
      `WITH CHECK`, Migration `..._144500_..._tighten_insert.sql`), **Lesen/Ändern nur Admin**
      (`is_admin()`). Verifiziert: anon insert ✓, anon select ✗; Advisors sauber.
- [x] **Catering-Posteingang im Admin** (`/admin/catering`, Tab „Anfragen"): Liste aller Anfragen
      (neu zuerst), als „erledigt" ↔ „neu" umschaltbar. Loader `lib/catering.ts`, Status-Action
      `app/admin/catering-actions.ts`, UI `components/admin/CateringInbox.tsx`, `AdminNav` erweitert.
- [x] Spam-Schutz: **Honeypot-Feld** (`company`, visuell versteckt) in Formular + Server Action.
- [ ] **E-Mail-Versand (offen — blockiert):** hübsches HTML-Template, Benachrichtigung an
      `kontakt@kurvenbeck.com` + optional Empfangsbestätigung an den Absender. **Weg B = Hostinger-
      SMTP** (`kontakt@kurvenbeck.com`); **SMTP-Zugangsdaten liegen noch nicht vor** → nur in
      `web/.env.local`, nie committen. Haken sitzt in `submitCateringRequest` (markierter TODO).
- [ ] Optional härter: serverseitige **Rate-Limit-Prüfung** (Honeypot deckt einfache Bots ab).

## 3. Backstube: echtes Online-Vorbestellen  ✅ (gebaut 2026-07-05)

**Gebaut & verifiziert (2026-07-05).** Gäste legen Mengen in den Warenkorb und bestellen
direkt auf der Backstube-Seite (kein WhatsApp) für den aktuell aktiven **Backtag**; im Admin
gibt es die **aggregierte Backliste** (Killer-Feature) + die einzelnen Bestellungen.

**Backtag-Modell (Entscheidung 2026-07-05): EIN global aktiver Backtag** in `site_settings`
(`backtag_active`/`backtag_date`/`backtag_deadline_text`/`backtag_pickup_text`). Der Betreiber
schaltet ihn im Admin ein/aus und setzt nach jedem Backtag den nächsten. Keine eigene Termin-
tabelle nötig → **keine** Abhängigkeit zu 1b mehr.

- [x] Migration `20260705190000_backstube_orders_schema.sql`: Tabelle `backstube_orders`
      (Name, E-Mail?, Telefon?, Anmerkung?, **`items` JSONB-Snapshot** [{id,name,qty,unitPrice}],
      `total`, `backtag_date`/`backtag_label`-Snapshot, `status` neu/erledigt) + Backtag-Keys in
      `site_settings`. **RLS wie Catering:** anon **nur INSERT** (gehärtete `WITH CHECK`:
      Statusprüfung, Feldlängen, `jsonb_array_length` 1–100, `total`-Grenzen), **Lesen/Ändern nur
      `is_admin()`**. Verifiziert: anon insert 201, malformed 401, anon select 42501; Advisors sauber.
- [x] Öffentliche Server Action `app/backstube/order-actions.ts` (`submitBackstubeOrder`):
      Honeypot, Backtag-Pflicht (kein aktiver Backtag → abgelehnt), **Namen/Preise autoritativ aus
      dem Live-Menü** (`getMenu('backstube')`) gesnapshottet (Client-Preise werden ignoriert).
- [x] Menügetriebener Warenkorb `components/backstube/BackstubeOrder.tsx` (Client, `localStorage`,
      +/- je Eintrag, schwebende Warenkorb-Leiste, Drawer mit Formular + Erfolgszustand). Nutzt den
      **Live-Menü**-Stand (nicht das alte statische `lib/products.ts`). `lib/backtag.ts`
      (client-sichere Typen/Helfer) + `lib/getBacktag.ts` (Server-Loader).
- [x] Backstube-Seite (`app/backstube/page.tsx`) zeigt jetzt die interaktive Bestellung statt der
      read-only Karte; „So funktioniert's" + Header-CTA auf echten Ablauf umgestellt (kein WhatsApp).
      Zeigt bei aktivem Backtag den grünen Status („Vorbestellen für … · Bestellschluss …"), sonst
      „Aktuell kein Backtag".
- [x] **Admin `/admin/bestellungen`** (Tab „Bestellungen", `AdminNav` erweitert): Backtag pflegen
      (`BacktagAdmin`, grün/rot Save), **aggregierte Backliste** über alle offenen Bestellungen,
      Einzelbestellungen mit Positionen + Status neu↔erledigt (`OrdersInbox`). Loader
      `lib/backstubeOrders.ts`, Actions `app/admin/order-actions.ts` (`updateBacktag`,
      `setBackstubeOrderStatus`).
- [ ] **E-Mail-Bestätigung (offen — blockiert):** an den Gast, nur wenn E-Mail angegeben. Hängt wie
      Catering an den **Hostinger-SMTP-Zugangsdaten** (`kontakt@kurvenbeck.com`, noch offen). Haken
      sitzt markiert in `submitBackstubeOrder`.
- [x] Startseiten-Text „online vorbestellen" ist damit **wahr**. (Alte Warenkorb-Demo
      `components/cart/*` + `lib/products.ts` bleiben ungenutzt im Repo — später aufräumen.)

## 4. „Empfehlung des Hauses"

- [x] **Empfehlung des Hauses:** Flag `is_recommendation` am Menü-Eintrag (Migration
      `20260705133000_menu_recommendation.sql`), im Admin per Checkbox ein-/ausschaltbar. Markierte
      Einträge werden auf der Bereichsseite oben als „Empfehlung des Hauses" hervorgehoben und aus
      der normalen Kategorieliste **herausgelöst** (steht sonst nicht auf der Karte). Komponente
      `components/MenuRecommendations.tsx`, gilt für Biergarten **und** Backstube. End-to-end verifiziert.

> **Entscheidung (2026-07-05):** Kennzeichnungen (vegetarisch/vegan/alkoholfrei) bleiben
> **Text** — es wird **keine** Icon-Darstellung geben.

## 4b. Druckbare Tisch-Speisekarte (Biergarten)  🖨️

**Problem:** Gäste am Tisch haben keine Karte. **Ziel:** Der Betreiber druckt aus dem Admin
eine **A4-Speisekarte**, die **1:1 dem Live-Menü aus der DB** entspricht, und legt sie an die Tische.

**Entscheidung (2026-07-05):** **keine** serverseitige PDF-/Word-Datei-Generierung, sondern eine
**Druck-Ansicht** (eigene Route + `@media print`-CSS). Der Betreiber öffnet sie über einen Button
im Admin und nutzt den Browser-Druckdialog → **drucken oder „Als PDF sichern"**. Vorteile: immer
live aus der DB, markengetreu (echte Fonts/Tokens), **keine** schweren Libraries, PDF-Export gratis.
**Word bewusst raus** (verleitet zum manuellen Nachbearbeiten → driftet vom echten Menü ab).

- [x] Umfang: **nur Biergarten** (Backstube evtl. später, gleiches Muster).
- [x] **Auth-geschützt** unter `app/admin/speisekarte/drucken/page.tsx` (`async` + `force-dynamic`,
      lädt `getMenu('biergarten')`; Route-Schutz via middleware + Admin-Allowlist-Check in der Seite).
- [x] A4-Druck-Layout: Kategorien (2 Spalten), Preise, Allergen-Codes + Legende, „Empfehlung des
      Hauses" oben, Logo-Kopf, Fußzeile. `@media print` + `@page A4` (randlos, `break-inside: avoid`
      für Kategorien/Fußzeile), Screen-Vorschau als A4-Blatt mit Toolbar (`.print-*` in globals.css).
- [x] **QR-Code** auf der Karte → `kurvenbeck.com/biergarten` (`qrcode` serverseitig als Inline-SVG).
- [x] Button „Speisekarte drucken (A4)" in der Admin-Speisekarte (nur Biergarten); Client-Toolbar
      `components/admin/PrintMenuToolbar.tsx` mit `window.print()` + „Zurück zur Verwaltung".

**Gebaut & verifiziert (2026-07-05):** `npm run build` grün, Route ist dynamisch (`ƒ`), Auth-Schutz
greift (unauth → 307 `/admin/login`). Nächster Schritt: eingeloggt visuell prüfen und ggf. echte
Termine/Druckränder feinjustieren. Backstube-Druckkarte später über denselben Weg möglich.

## 5. Recht, Begriffe & Metadaten

- [x] **Titelschutz geprüft (2026-07-06):** Live-Code (alle `.tsx`) **und** DB-Inhalte
      (Menüpunkte/-kategorien, `site_settings`, Öffnungstage, Catering-Anfragen) systematisch
      auf „Bäcker"/„Bäckerei" durchsucht — **null Treffer**. Einzige Fundstellen waren interne
      Doku-Notizen (`TODO.md`, `public/images/README.md`), nicht nutzersichtbar. Titelschutz ist
      sauber.
- [x] **„seit 1978" entfernt (2026-07-06, endgültig):** Backstube existiert erst ~1,5 Jahre, die
      Jahreszahl passt nicht zum Gesamtbetrieb. Entfernt aus `app/layout.tsx` (Meta-/OG-
      Beschreibung, 2×), `CLAUDE.md`, sowie aus den `*.html`-Design-Referenzen im Root
      (Logo-Suffix, Hero-Eyebrow, Footer-Zeile, Stat-Kachel in `home-split.html`).
- [ ] Impressum, Datenschutz, AGB mit echten Texten füllen (`app/impressum|datenschutz|agb`
      sind Platzhalter). Bei echtem Formular/Bestellung: Datenschutz auf Datenverarbeitung
      anpassen.

## 6. Local-SEO

- [x] **Strukturierte Daten (2026-07-06):** JSON-LD nach schema.org auf der Startseite
      (`lib/structuredData.ts`, eingebunden in `app/page.tsx`) — Typ **`FoodEstablishment`**
      (bewusst **ohne** „Bakery", Titelschutz), mit Adresse + Telefon aus `site_settings` und
      Öffnungszeiten (heute + `upcoming`) aus `opening_days` als `openingHoursSpecification`
      je Datum. Live geprüft: Adresse/Telefon/Öffnungstage korrekt im `<script type="application/ld+json">`.
- [x] **`sitemap.xml` + `robots.txt` (2026-07-06):** `app/sitemap.ts` (alle öffentlichen Routen)
      + `app/robots.ts` (Disallow `/admin`, `/auth`, verweist auf die Sitemap). Next.js-Bordmittel
      (Metadata Routes), kein manuelles XML. Build + Live geprüft (`/sitemap.xml`, `/robots.txt`).
- [ ] **Google-Business-Profil verlinken (NAP-Konsistenz)** — mit dem Kunden zu klären, wer das
      Profil anlegt/verwaltet und mit welcher Adresse/Telefonnummer (muss exakt mit der Website
      übereinstimmen). **Steht heute Abend (2026-07-06) mit dem Kunden an.**

## 7. Restliche Fotos einsetzen

**Erledigt:** Logo (Header/Footer/Hero-Badge + Favicon), alle vier Catering-Kacheln,
Biergarten-Intro (`garten.webp`).

**Entschieden (2026-07-06) — damit erledigt:**
- **Startseiten-Kachel Biergarten** bleibt bewusst das wiederverwendete Hero-Foto
  (`home/startseite-hero.webp`) — aktuell kein anderes Foto vorhanden. Kein offener Punkt mehr.
- **Backstube-Waren bleiben ohne Fotos** (wie die Speisekarte, reines Text-Format) — bewusste
  Entscheidung, keine Produktfotos für Brezel/Briegl/Körnerwecken/etc. beauftragt. War bereits so
  in CLAUDE.md verankert („Menüs ohne Produktfotos — Biergarten **und** Backstube"); der
  `backstubePhotos`-Eintrag in `lib/images.ts` wird nur für **ein** generisches Hero-Foto auf der
  Backstube-Seite genutzt, nicht pro Ware — entspricht der Entscheidung, keine Änderung nötig.

## 8. Next.js-Sicherheitsupdate (separat)

- [x] **Erledigt (2026-07-05):** Update **Next 15.1.6 → 15.5.20** (behebt Middleware-SSRF,
      Cache-Poisoning, RCE u. a.). Verbleibende moderate postcss-XSS (Build-Tool, kein Laufzeitrisiko)
      per `overrides: { "postcss": "^8.5.10" }` gelöst → **`npm audit` = 0 vulnerabilities**.
      `npm run build` grün, alle Routen im Dev-Smoke-Test 200 (bzw. 307 Login-Schutz).

## 9. Repo auf Kurvenbeck-Org umziehen

**Stand:** Code im privaten Repo `ihringmichael-max/Homepage-Kurvenbeck` (Account ist kein
Org-Mitglied → direkter Push nach `Kurvenbeck/…` bisher nicht möglich).

- [ ] Zugang klären (`ihringmichael-max` in Org **Kurvenbeck** einladen **oder** Org-Account nutzen).
- [ ] Umzug: GitHub **Transfer ownership** oder Org-Repo + Remote umhängen
      (`git remote set-url origin …Kurvenbeck/Homepage-Kurvenbeck.git`).

## 10. Feinschliff (optional)

- [ ] `aria-label` für Telefon-/WhatsApp-CTAs.
- [ ] Scroll-Reveal selektiv aktivieren (`enable-scroll-animations` am `<body>`).
- [ ] Kontakt/Anfahrt-Seite mit Karte (Handoff §12.5) — nutzt Adresse aus 1a.
- [ ] Admin: Handy-Tauglichkeit prüfen (Betreiber pflegt vermutlich vom Smartphone).

## 11. Go-Live-Checkliste

- [ ] **Supabase Auth URL Configuration umstellen:** Site URL + Redirect URLs im Supabase-Dashboard
      (Authentication → URL Configuration) von `localhost:3003` auf die echte Domain
      (`https://kurvenbeck.com`) setzen — sonst zeigt der Magic-Link-Login im Admin nach dem
      Go-Live noch auf localhost und funktioniert nicht.
