# Projekt-Übergabe — Kurvenbeck Website

Sauberer Handover-Stand der Kurvenbeck-Web-Präsenz. Dieses Dokument beschreibt
**was existiert, wie man es startet und wie es weitergeht**. Ergänzende Dokumente:

| Dokument | Inhalt |
|---|---|
| `README.md` (Root) | Ursprüngliches Design-Briefing + Umsetzungsstand (§0, §12) |
| `CLAUDE.md` (Root) | Verbindliche Projektkonventionen (Tonalität, Tokens, Kontaktdaten, Icons) |
| `web/README.md` | App-Setup & Struktur (Kurzfassung) |
| `web/TODO.md` | Priorisierte offene Aufgaben |
| `web/public/images/README.md` | Bild-Upload: Dateinamen, Maße, Motive |

---

## 1. Was ist das

Web-Präsenz des Familienbetriebs **Kurvenbeck** mit drei Bereichen (Biergarten,
Catering, Backstube). Umgesetzt nach Design-Richtung **Option C „Warm &
Handwerklich"**. Die `*.html`-Dateien im Root sind die **Design-Referenzen** und
werden **nicht** ausgeliefert — die produktive App liegt unter **`web/`**.

## 2. Tech-Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- Styling: **eine globale CSS-Datei** mit Design-Tokens (`web/app/globals.css`) —
  kein Tailwind, keine CSS-in-JS.
- Fonts via `next/font`: **Playfair Display** (Display) + **DM Sans** (Body).
- Icons: **`@tabler/icons-react`**.
- **Supabase** (Postgres 17) für das Menü-Backend angebunden via `@supabase/ssr` —
  siehe §10. Catering-Formular & Backstube-Warenkorb sind weiterhin Demos.

## 3. Schnellstart

```bash
cd web
npm install
npm run dev      # http://localhost:3003 — Port fest verdrahtet, siehe CLAUDE.md
npm run build    # Production-Build inkl. Typecheck + Lint (muss grün sein)
npm start        # Production-Server (ebenfalls Port 3003)
```

Node ≥ 18 (entwickelt unter Node 24). Build ist aktuell grün, alle Seiten werden
statisch prerendered.

## 4. Repository & Zugang

- Aktuell: **privates Repo** `ihringmichael-max/Homepage-Kurvenbeck`, Branch `main`.
- Zielzustand: Umzug in die Org **`Kurvenbeck`** — Schritte in `web/TODO.md` (Punkt 7).

## 5. Struktur

```
web/
├─ app/
│  ├─ layout.tsx          # Fonts, globale Metadata/OpenGraph
│  ├─ globals.css         # ALLE Tokens + Chrome- + Komponenten-Styles
│  ├─ page.tsx            # Startseite (Option C)
│  ├─ biergarten/         # Bereichsseite + Speisekarte
│  ├─ catering/           # Bereichsseite + Anfrageformular
│  ├─ backstube/          # Bereichsseite + Warenkorb
│  └─ impressum|datenschutz|agb/   # Rechts-Platzhalterseiten
├─ components/
│  ├─ SiteHeader.tsx      # Sticky-Header + mobile Off-Canvas-Nav (client)
│  ├─ SiteFooter.tsx
│  ├─ Logo.tsx            # Echtes Logo (public/images/logo/) in Header/Footer/Hero
│  ├─ Photo.tsx           # next/image-Slot mit Platzhalter-Fallback
│  ├─ Placeholder.tsx     # gestreifter Platzhalter
│  ├─ CateringForm.tsx    # Formular mit Validierung + Erfolgszustand (client)
│  ├─ LegalPage.tsx       # Chrome für Rechtsseiten
│  └─ cart/               # CartContext, CartButton, CartDrawer, ProductGrid (client)
├─ lib/
│  ├─ products.ts         # Backstube-Sortiment + formatEUR
│  ├─ images.ts           # Foto-Registry (Slots null → Platzhalter)
│  └─ siteSettings.ts     # zentrale Kontaktdaten (Telefon, tel:, wa.me)
├─ utils/supabase/        # Supabase-Clients: client.ts (Browser), server.ts, middleware.ts
├─ middleware.ts          # Session-Refresh (Route-Schutz /admin folgt in Phase 4)
├─ supabase/migrations/   # SQL-Migrationen (Menü-Schema + Seed)
├─ plans/                 # Umsetzungspläne (biergarten-menu-backend.md)
└─ public/images/         # WebP-Upload-Ordner (hero/home/biergarten/catering/backstube)
```

## 6. Wichtige Konzepte

- **Design-Tokens** sind verbindlich (`globals.css`, `:root`). Immer die
  `--token`-Variablen nutzen, keine „magischen" Werte.
- **Tonalität:** durchgängige **Du-Form** (kein „Sie"); schwäbischer Dialekt nur
  in Headlines. Details + Beispiele in `CLAUDE.md`.
- **Bilder:** echte Fotos als WebP in `web/public/images/...` ablegen
  (Namen/Maße: `web/public/images/README.md`), dann Slot in `web/lib/images.ts`
  von `null` auf `{ src, alt }` setzen. Leere Slots zeigen den Platzhalter →
  keine kaputten Bilder.
- **Kontaktdaten:** Telefonnummer **nicht hardcoden** — einzige Quelle
  `web/lib/siteSettings.ts`. `telHref`/`whatsappHref` werden daraus abgeleitet
  (Footer + Biergarten-CTAs + Backstube-Banner nutzen sie).
- **Warenkorb (Backstube):** Client-State via `CartContext` mit
  `localStorage`-Persistenz; Drawer öffnet automatisch beim Hinzufügen.

## 7. Funktionsumfang & Status

**Fertig:** alle vier Seiten + Rechts-Platzhalter, mobile Navigation, Sticky-Header,
Footer, A11y/SEO-Basis (Landmarks, aria, Fokus-Styles, `prefers-reduced-motion`,
Metadata/OG), Bild-System, zentrale Kontaktdaten, **echtes Logo** (Header, Footer,
großes Badge im Startseiten-Hero, Favicon/Apple-Touch-Icon), **Catering-Fotos**
(alle vier Menü-Kacheln befüllt).

**Demos (noch ohne Backend):**
- **Catering-Formular** — Client-Validierung + Erfolgszustand, aber kein echter Versand.
- **Backstube-Warenkorb** — voll bedienbar inkl. Persistenz, aber kein echter Checkout.

**Platzhalter:** noch fehlende Fotos (Biergarten/Backstube/Home-Karten teils offen,
siehe `web/public/images/README.md`), Inhalte (Adresse/Preise/Öffnungszeiten),
Rechtstexte.

## 8. Nächste Schritte

Priorisiert in **`web/TODO.md`** — kompakt:

1. Telefonnummer aus Supabase `site_settings` laden (Quelle: `siteSettings.ts`).
2. Restliche echte Fotos einsetzen + Slots freischalten (+ `alt`-Texte) — Logo und
   Catering-Fotos sind bereits erledigt.
3. Catering-Formular an Backend/E-Mail anbinden.
4. Backstube-Checkout + Produktdaten aus CMS.
5. Inhalte & Rechtstexte finalisieren.
6. Repo in Org `Kurvenbeck` umziehen.

## 9. Deployment (noch offen)

Empfehlung: **Vercel** (nahtlos für Next.js) oder beliebiger Node-Host. Vor dem
ersten Deploy: die Supabase-ENV (siehe §10) im Host hinterlegen; `.env.local` ist
git-ignoriert — Keys niemals committen.

## 10. Menü-Backend (in Arbeit)

Ziel: Der nicht-technische Kunde pflegt Speise-/Getränkekarte inkl. Allergene selbst
über eine eigene Admin-Seite. **Verbindliche Spezifikation:** der Umsetzungsplan
`web/plans/biergarten-menu-backend.md` + die Projekt-Memories `biergarten-menu-backend`
und `menu-no-images`. Alle Architektur-Entscheidungen wurden per Grill-me festgezurrt.

**Kernentscheidungen:** dynamisches SSR (Änderungen sofort live) · öffentliches Lesen
via Publishable-Key + RLS · Admin-Schreiben nur über Server Actions mit eingeloggter
Sitzung (RLS: `auth.email()` in `admins`), **kein `service_role` in der App** ·
Menüs **ohne Fotos** (auch Backstube später) · Allergene als deutsches Buchstaben-Schema
(A–R), Tags nur vegetarisch/vegan/alkoholfrei.

**Supabase-Projekt:** „Kurvenbeck's Project" (`dbzxowlgmwnytanfnzdb`, EU-Frankfurt).

**ENV (in `web/.env.local`, git-ignoriert — beim Klonen neu anlegen):**
```
NEXT_PUBLIC_SUPABASE_URL=https://dbzxowlgmwnytanfnzdb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…   # Dashboard → Settings → API
```

**Stand:**
- ✅ **Phase 1** — Supabase-Clients (`utils/supabase/`), `middleware.ts`, Packages, `.env.local`.
- ✅ **Phase 2** — Schema + RLS + Seed (2 Migrationen in `supabase/migrations/`); DB enthält
  die heutige Biergarten-Karte 1:1 (12 Einträge), 14 Allergene, `admins`-Allowlist. Security-
  Advisors sauber; `anon` kann lesen, aber nicht schreiben und `admins` nicht sehen (getestet).

**Nächster Schritt — Phase 3:** Biergarten-Seite (`app/biergarten/page.tsx`) auf DB umstellen
(Loader `lib/menu.ts`, gleiche CSS-Klassen, Allergen-Legende), Optik muss identisch bleiben.
Danach Phase 4 (Magic-Link-Auth + `/admin`-Schutz), Phase 5 (Admin-Oberfläche), Phase 6 (Abschluss).

**Hinweis für neue Session:** Schema-Änderungen laufen über den **Supabase-MCP** (muss neu
autorisiert werden, falls die Verbindung getrennt wurde). Phase 3 selbst braucht keinen MCP —
nur die App liest über den Publishable-Key.

**Offen (nicht Menü-Backend):** `npm audit` meldet Schwachstellen in **Next.js 15.1.6**
(u. a. Middleware-SSRF) → separates Update auf Next 15.5.x empfohlen, siehe `web/TODO.md`.
