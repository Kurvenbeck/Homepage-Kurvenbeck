# TODO

Offene Aufgaben für die Kurvenbeck-Web-App. Reihenfolge ≈ Priorität.

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

## 2. Echte Fotos einsetzen

- [ ] WebP-Dateien gemäß `public/images/README.md` ablegen.
- [ ] Slots in `web/lib/images.ts` freischalten (von `null` auf `{ src, alt }`).
- [ ] Aussagekräftige `alt`-Texte je Bild (A11y/SEO).
- [ ] Hero-Bild bleibt `priority`.

## 3. Echtes Logo

- [ ] Logo als WebP/SVG einsetzen statt Wortmarke-Fallback (`components/Logo.tsx`),
      sobald das Asset vorliegt.

## 4. Catering-Formular an Backend anbinden

- [ ] `components/CateringForm.tsx` aktuell Demo (kein echter Versand).
      An E-Mail/Backend anbinden inkl. serverseitiger Validierung, Erfolgs-/Fehlerzustand,
      Spam-Schutz.

## 5. Backstube-Bestellung produktiv machen

- [ ] Checkout-Flow statt Demo-Warenkorb: Abhol-Termin/Slot-Auswahl,
      Zusammenfassung, Bestellübermittlung.
- [ ] Produktdaten aus CMS/Backend statt `web/lib/products.ts`.

## 6. Inhalte & Recht finalisieren

- [ ] Speisekarte/Preise/Öffnungszeiten/Adresse final einpflegen (z. B. via CMS).
- [ ] Impressum, Datenschutz, AGB mit echten Texten füllen
      (`app/impressum`, `app/datenschutz`, `app/agb` sind Platzhalter).

## 7. Feinschliff (optional)

- [ ] `aria-label` für Telefon-/WhatsApp-CTAs (z. B. „Per WhatsApp schreiben").
- [ ] Scroll-Reveal selektiv aktivieren (`enable-scroll-animations` am `<body>`),
      `prefers-reduced-motion` ist bereits berücksichtigt.
- [ ] Kontakt/Anfahrt-Seite mit Karte (Handoff §12.5).
