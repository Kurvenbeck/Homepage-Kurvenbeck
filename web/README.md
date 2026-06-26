# Kurvenbeck — Web (Next.js)

Umsetzung der Design-Referenzen (Option C „Warm & Handwerklich") als Next.js App
(App Router, TypeScript). Design-Tokens, Komponenten und Verhalten folgen dem
Handoff (`../README.md`) und dem Design-Guide.

## Sprache & Anrede

Alle nutzersichtbaren Texte sind auf **Deutsch** und durchgängig in der
**Du-Form** (informell, kein „Sie" — `du/dein/dir`, „du" kleingeschrieben).
Schwäbischer Dialekt nur in Headlines/Marketing, nicht in Formularen oder
Rechtstexten. Details: `../CLAUDE.md`.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build
npm start        # Production-Server
```

## Struktur

- `app/layout.tsx` — Root-Layout, lädt Playfair Display + DM Sans via `next/font`.
- `app/globals.css` — alle Design-Tokens + Chrome- und Komponenten-Styles.
- `app/page.tsx` — Startseite (Option C).
- `app/biergarten` · `app/catering` · `app/backstube` — Bereichsseiten.
- `app/impressum` · `app/datenschutz` · `app/agb` — Rechts-Platzhalterseiten.
- `components/` — `SiteHeader` (inkl. mobiler Off-Canvas-Navigation), `SiteFooter`,
  `Logo`, `Placeholder`, `CateringForm`, `cart/*`.
- `lib/products.ts` — Backstube-Sortiment + `formatEUR`.

## Umgesetzte offene Punkte (Handoff §12)

1. **Mobile-Navigation** — Hamburger + Off-Canvas-Sheet in `SiteHeader` (Esc/Scrim schließt).
2. **Catering-Formular** — Client-Validierung (Name/E-Mail/Gäste) + Erfolgszustand.
   *Demo:* noch keine echte Übermittlung — Backend/E-Mail ist anzubinden (`CateringForm.tsx`, `TODO`).
3. **Backstube-Warenkorb** — `CartContext` mit `localStorage`-Persistenz, Drawer
   (Auto-Open beim Hinzufügen, Esc/Scrim schließt), Mengen-Stepper.
   *Demo:* kein echter Checkout — Abhol-Slot/Bestellung folgen.
5. **Standardseiten** — Impressum/Datenschutz/AGB als befüllbare Platzhalter angelegt.
7. **A11y/SEO** — semantische Landmarks, `aria`-Attribute, Fokus-Styles,
   `prefers-reduced-motion`, Metadata/OpenGraph im Layout je Seite.

## Noch ausstehend (durch Betreiber/Backend)

- Echtes Logo (WebP/SVG) statt Wortmarke-Fallback (`Logo.tsx`).
- Echte Fotos statt beschrifteter Platzhalter (`Placeholder` → `next/image`, Hero `priority`).
- Produkt-/Speisekartendaten aus CMS; Catering- und Bestell-Backend.
- Finale Inhalte (Adresse, Telefon, Preise, Öffnungszeiten) und Rechtstexte.
