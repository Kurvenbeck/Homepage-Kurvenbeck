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

- [ ] Tabelle `site_settings` (`key text primary key`, `value text not null`, `updated_at`).
      Keys u. a. `contact_phone` (E.164, ohne führende Null → für `wa.me`), `address`.
- [ ] RLS: öffentlich lesbar, Schreiben nur Admin (wie Menü-Tabellen, `is_admin()`).
- [ ] `web/lib/siteSettings.ts` → async Loader (`getSiteSettings()`, gecacht); `telHref`/
      `whatsappHref` daraus ableiten; Fallback, damit nie ein leerer `tel:`/`wa.me` entsteht.
- [ ] Admin-UI: eigener Tab/Bereich „Einstellungen" zum Pflegen von Telefon & Adresse.
- [ ] Verbraucher (Biergarten-CTAs, Footer) auf den Loader umstellen (sind Server-Components).

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

## 4. „Empfehlung des Hauses" + Menü-Scanbarkeit

- [ ] **Empfehlung des Hauses:** hervorgehobener Sonder-Eintrag (z. B. spontaner Schweinebraten),
      der **sonst nicht auf der Karte** steht. Umsetzung: Flag/Feld am Menü-Eintrag
      (`is_recommendation` o. ä.) + eigene Hervorhebung auf der Bereichsseite; im Admin ein-/
      ausschaltbar. Gilt für Biergarten (und ggf. Backstube).
- [ ] Kennzeichnungen (vegetarisch/vegan/alkoholfrei) als kleine **Icons** statt Text —
      bessere Scanbarkeit der Karte.

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

- [ ] `npm audit`: Schwachstellen in **Next.js 15.1.6** (Middleware-SSRF, Cache-Poisoning).
      Update auf **Next 15.5.x**, danach `npm run build` grün halten. Getrennt durchführen.

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
