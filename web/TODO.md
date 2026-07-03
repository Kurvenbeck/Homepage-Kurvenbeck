# TODO

Offene Aufgaben für die Kurvenbeck-Web-App. Reihenfolge ≈ Priorität.

> **✅ Erledigt — Menü-Backend (Biergarten + Backstube):** Supabase komplett angebunden
> (Clients, Middleware, Schema, RLS, Seed). **Biergarten und Backstube** lesen ihre Karte
> live aus der DB (Text-Format ohne Fotos); Magic-Link-Admin unter `/admin` pflegt beide
> Bereiche über Tabs (Kategorien/Einträge/Allergene). Phasen 1–6 + Backstube-Andockung
> end-to-end verifiziert (2026-07-03). Details: `plans/biergarten-menu-backend.md` +
> HANDOFF.md §10.
> Offene Folgeschritte: Catering ans Backend andocken, Drag&Drop-Sortierung, eigener
> SMTP-Absender über `kurvenbeck.com` (Supabase-Standard-Mailversand hat niedriges Limit).

## 0. Next.js-Sicherheitsupdate (separat, vorziehen erwägen)

- [ ] `npm audit` meldet Schwachstellen in **Next.js 15.1.6** (u. a. Middleware-SSRF,
      Cache-Poisoning). Update auf **Next 15.5.x** und danach `npm run build` grün halten.
      Getrennt vom Menü-Backend-Plan durchführen.

## 1. Telefonnummer aus Supabase (`site_settings`) lesen

**Ziel:** Die Kontakt-Telefonnummer nicht mehr statisch in `web/lib/siteSettings.ts`
halten, sondern dynamisch aus einer Supabase-Tabelle `site_settings`
(key: `contact_phone`) laden. Sie wird genutzt für:

- Biergarten-CTAs „Tisch reservieren" (`tel:`) und „WhatsApp" (`wa.me`) — `app/biergarten/page.tsx`
- Footer-Telefonnummer — `components/SiteFooter.tsx`
- (künftig) überall, wo eine Kontaktnummer auftaucht

**Aktueller Stand:** zentrale, statische Quelle in `web/lib/siteSettings.ts`
(`siteSettings.contactPhone` + Helfer `telHref` / `whatsappHref`). Alle Verbraucher
ziehen bereits aus dieser einen Quelle — es muss also nur die *Datenherkunft*
getauscht werden.

- [ ] Supabase-Projekt anbinden (`@supabase/supabase-js`, Server-Client via `@supabase/ssr`).
      ENV: `NEXT_PUBLIC_SUPABASE_URL`, Anon-/Service-Key in `.env`.
- [ ] Tabelle `site_settings` anlegen: `key text primary key`, `value text not null`,
      `updated_at timestamptz`. Zeile `('contact_phone', '+49…')` einpflegen
      (E.164-Format, ohne führende Null — wichtig für `wa.me`).
- [ ] RLS: öffentliche **Lese**-Policy nur für `site_settings`, Schreiben nur via Service-Role/Admin.
- [ ] `web/lib/siteSettings.ts` zu async Loader umbauen (`getSiteSettings()`,
      gecacht via `revalidate`); `telHref`/`whatsappHref` aus dem Wert ableiten.
- [ ] Verbraucher auf den Loader umstellen (sind Server-Components → unkritisch).
- [ ] Fallback, falls DB-Wert fehlt, damit nie ein leerer `tel:`/`wa.me`-Link entsteht.
- [ ] `npm run build` grün halten.

**Hinweis:** Das `supabase`-Skill kann für Schema, RLS und SSR-Integration genutzt werden.

## 2. Restliche echte Fotos einsetzen

**Erledigt:** Logo (Header/Footer/Hero-Badge + Favicon), alle vier Catering-Kacheln
(Fingerfood, Schwäbisches Buffet, Geburtstage & Jubiläen, Hochzeits-Menü).

- [ ] Verbleibende WebP-Dateien gemäß `public/images/README.md` ablegen
      (Biergarten-Intro, Backstube-Produkte, Home-Bereichskarten — prüfen, welche
      Slots in `web/lib/images.ts` noch `null` sind).
- [ ] Slots in `web/lib/images.ts` freischalten (von `null` auf `{ src, alt }`).
- [ ] Aussagekräftige `alt`-Texte je Bild (A11y/SEO).
- [ ] Hero-Bild bleibt `priority`.

## 3. Catering-Formular an Backend anbinden

- [ ] `components/CateringForm.tsx` aktuell Demo (kein echter Versand).
      An E-Mail/Backend anbinden inkl. serverseitiger Validierung, Erfolgs-/Fehlerzustand,
      Spam-Schutz.

## 4. Backstube-Bestellung produktiv machen

**Stand:** Das Backstube-**Sortiment** wird jetzt als Text-Menü aus Supabase gelesen und im
Admin gepflegt (siehe Menü-Backend oben). Vorbestellung läuft aktuell über WhatsApp. Der
frühere Demo-Warenkorb ist von der Seite entfernt; die Komponenten (`components/cart/*`,
`lib/products.ts`) bleiben für einen echten Checkout aufbewahrt.

- [ ] Echter Checkout-Flow (statt WhatsApp): Abhol-Termin/Slot-Auswahl, Zusammenfassung,
      Bestellübermittlung — kann die vorhandenen Warenkorb-Komponenten wiederverwenden.
- [ ] Falls Checkout kommt: Produktdaten/Preise aus dem Menü-Backend statt `lib/products.ts`
      beziehen (eine Quelle).

## 5. Inhalte & Recht finalisieren

- [ ] Speisekarte/Preise/Öffnungszeiten/Adresse final einpflegen (z. B. via CMS).
- [ ] **Öffnungszeiten ans Backend binden (eine Quelle pro Bereich).** Aktuell hart
      im Code: Biergarten `Sa & So · Feiertage, 11–22 Uhr` in `app/biergarten/page.tsx`.
      Ziel: pro Bereich (Biergarten, Backstube, Catering) genau eine Quelle
      (z. B. `site_settings`/CMS), aus der die jeweilige Leistungsseite liest.
      Der Footer zeigt bewusst **keine** Öffnungszeiten mehr, sondern verlinkt nur
      auf die Bereiche — Doppelpflege vermeiden.
- [ ] Impressum, Datenschutz, AGB mit echten Texten füllen
      (`app/impressum`, `app/datenschutz`, `app/agb` sind Platzhalter).

## 6. Repo auf Kurvenbeck-Org umziehen

**Stand:** Code liegt vorerst im privaten Repo
`ihringmichael-max/Homepage-Kurvenbeck` (Account `ihringmichael-max` ist kein
Mitglied der Org `Kurvenbeck`, daher konnte nicht direkt nach
`Kurvenbeck/Homepage-Kurvenbeck` gepusht werden).

- [ ] Zugang klären: `ihringmichael-max` in die Org **Kurvenbeck** einladen
      (Schreibrechte) **oder** mit dem Org-Account arbeiten.
- [ ] Umzug auf `Kurvenbeck/Homepage-Kurvenbeck`, eine der Optionen:
  - Repo per GitHub **transferieren** (Settings → Transfer ownership), oder
  - Org-Repo anlegen und Remote umhängen:
    `git remote set-url origin https://github.com/Kurvenbeck/Homepage-Kurvenbeck.git && git push -u origin main`
- [ ] Danach ggf. lokale Klone/Links aktualisieren.

## 7. Feinschliff (optional)

- [ ] `aria-label` für Telefon-/WhatsApp-CTAs (z. B. „Per WhatsApp schreiben").
- [ ] Scroll-Reveal selektiv aktivieren (`enable-scroll-animations` am `<body>`),
      `prefers-reduced-motion` ist bereits berücksichtigt.
- [ ] Kontakt/Anfahrt-Seite mit Karte (Handoff §12.5).
