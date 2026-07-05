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
- [ ] Footer zeigt bewusst **keine** Öffnungszeiten (Doppelpflege vermeiden), nur Verlinkung.

## 2. Catering-Formular echt machen (Backend + E-Mail + Posteingang)  ⭐

`components/CateringForm.tsx` ist heute eine **Demo ohne Versand** → jede Anfrage geht verloren.
Gewünscht: echter Versand als **schöne E-Mail an `kontakt@kurvenbeck.com`** + Anfrage im Admin.

- [ ] Server Action mit **serverseitiger** Validierung (Client-Validierung bleibt als UX).
- [ ] Anfrage in Supabase speichern (Tabelle `catering_requests`: Name, E-Mail, Anlass,
      Gäste, Wunschdatum, Nachricht, `created_at`, `status` = neu/erledigt).
- [ ] **Catering-Posteingang im Admin** (eigener Tab): Liste aller Anfragen, als „erledigt"
      markierbar. (Definitiv gewünscht.)
- [ ] E-Mail-Versand: hübsches HTML-Template. Benachrichtigung an `kontakt@kurvenbeck.com`;
      optional Empfangsbestätigung an den Absender, **falls** E-Mail angegeben.
- [ ] Spam-Schutz (Honeypot-Feld + serverseitige Rate-Limit-Prüfung).
- [ ] **Offene Entscheidung:** E-Mail-Provider (Resend empfohlen) + Domain-Verifizierung für
      `kurvenbeck.com` (SPF/DKIM) — braucht Account + DNS-Zugriff vom Betreiber.

## 3. Backstube: echtes Online-Vorbestellen (Konzept festgehalten)  🔭

**Wichtig — aktueller Ablauf (bleibt gültig):** Kurvenbeck kündigt per WhatsApp / Mundpropaganda /
Homepage an, wann gebacken wird; Bestellungen bis z. B. **Freitag 18 Uhr**, Abholung
**Samstag 8 Uhr**. Die Backstube-Seite zeigt heute das Sortiment als Text-Menü + WhatsApp-CTA.
Der Startseiten-Text „online vorbestellen" ist deshalb aktuell **noch nicht wahr** → entweder
Copy anpassen **oder** dieses Feature bauen.

**Vision (vom Betreiber, 2026-07-05):** kein WhatsApp (kostet) — echtes leichtes Vorbestellen.
- Gast (z. B. „Otto Schmid") legt Mengen in den **Warenkorb** (5 Brezeln, 3 Körnerwecken,
  7 Briegl), schickt ab → Bestätigung „Bestellung eingegangen".
- **E-Mail optional:** wird eine E-Mail hinterlegt → Empfangsbestätigung per Mail.
- **Admin — pro Bestellung:** jede Bestellung erscheint mit **Name + bestellten Positionen**
  (bei 25 Bestellungen 25 Einträge).
- **Admin — Gesamtübersicht (Killer-Feature):** aggregiert **wie viel von jedem Produkt
  insgesamt** zu backen ist (z. B. „Brezeln: 112 · Körnerwecken: 40 · Briegl: 88").

**Bausteine schon da:** Warenkorb-Komponenten (`components/cart/*`) sind absichtlich erhalten;
Sortiment liegt bereits im Menü-Backend. **Abhängigkeit:** braucht ein „Backtag/Abholtag"-Modell
(wann ist Bestellung möglich, bis wann, Abholzeitpunkt) — hängt an Punkt 1b/Öffnungs-/Termin-Logik.

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

- [ ] **Titelschutz durchziehen:** nirgends „Bäcker"/„Bäckerei" (siehe CLAUDE.md). Person =
      „Betreiber/Familie/Team". Bestehende Texte/Alt-Texte gegenlesen.
- [ ] **„seit 1978" prüfen:** steht live in `app/layout.tsx` (Meta-/OG-Beschreibung, 2×) sowie
      in CLAUDE.md/README. Backstube existiert erst ~1,5 Jahre → **klären, ob die Jahreszahl
      für den Gesamtbetrieb überhaupt stimmt**; sonst entfernen/ersetzen.
- [ ] Impressum, Datenschutz, AGB mit echten Texten füllen (`app/impressum|datenschutz|agb`
      sind Platzhalter). Bei echtem Formular/Bestellung: Datenschutz auf Datenverarbeitung
      anpassen.

## 6. Local-SEO

- [ ] Strukturierte Daten (`schema.org`) — **ohne** „Bakery"! Passender Typ (z. B.
      `Restaurant`/`FoodEstablishment`) mit Adresse, Öffnungszeiten (aus 1b), Geo, Telefon.
- [ ] `sitemap.xml` + `robots.txt`.
- [ ] Google-Business-Profil (NAP-Konsistenz) verlinken.

## 7. Restliche Fotos einsetzen

**Erledigt:** Logo (Header/Footer/Hero-Badge + Favicon), alle vier Catering-Kacheln.

- [ ] Verbleibende WebP-Dateien gemäß `public/images/README.md` ablegen (Biergarten-Intro,
      Home-Bereichskarten — welche Slots in `web/lib/images.ts` noch `null` sind). **Menüs
      bleiben bewusst ohne Produktfotos.**
- [ ] Slots freischalten (`null` → `{ src, alt }`), aussagekräftige `alt`-Texte, Hero bleibt `priority`.

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
