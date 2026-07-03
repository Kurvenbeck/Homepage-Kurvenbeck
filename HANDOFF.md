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
- ✅ **Phase 3** — Biergarten-Seite liest aus DB. Loader `lib/menu.ts` (`getMenu(area)`,
  `formatPrice`), `app/biergarten/page.tsx` ist `async` + `force-dynamic` (SSR), gleiche
  CSS-Klassen → optisch identisch. Allergen-Codes `(A, G)` am Gericht + dezente Legende
  (`.menu-legend`, aktuell leer, da noch keine Allergene gepflegt). Build grün, live gegen DB
  verifiziert (12 Einträge, Reihenfolge/Preise/Tags korrekt).
- ✅ **Phase 4 — verifiziert** — Magic-Link-Auth + Route-Schutz. Login `app/admin/login/page.tsx`
  (`signInWithOtp`, `shouldCreateUser:false`), Confirm-Route `app/auth/confirm/route.ts`
  (`verifyOtp` **und** `exchangeCodeForSession`-Fallback), Route-Schutz in
  `utils/supabase/middleware.ts` (`/admin/*` → Login), `app/admin/page.tsx` als Landing mit
  Admin-Allowlist-Check (Defense-in-Depth) + Logout (Server Action). **Login läuft
  end-to-end** (getestet 2026-07-03 mit `ihringmichael@gmail.com`).
  Dashboard-Config erledigt: Site URL `http://localhost:3003`, Redirect URLs
  `http://localhost:3003/**`, Magic-Link-Template auf token_hash umgestellt
  (`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` — nötig, weil
  `@supabase/ssr` PKCE nutzt), öffentliche Registrierung aus. **Auth-User:** genau ein Konto
  (`ihringmichael@gmail.com`); `kontakt@kurvenbeck.com` ist in `admins`, hat aber noch kein
  Auth-Konto. Detail-Fallstrick in Projekt-Memory `kurvenbeck-admin-auth`: Auth-User **nie**
  manuell per SQL in `auth.users` anlegen (GoTrue braucht leere Strings statt NULL in den
  Token-Spalten → sonst „500: Database error finding user"); nutze Dashboard → Auth → Users.

- ✅ **Phase 5 — verifiziert** — Admin-Oberfläche unter `/admin`. Loader `getMenuForAdmin(area)`
  (`lib/menu.ts`) lädt alle Gerichte inkl. nicht-verfügbarer + Allergen-Stammdaten. Server
  Actions `app/admin/actions.ts` (create/rename/delete/move Kategorie; create/update/delete/
  move Gericht; Preis-Normalisierung „12,90"→numeric; Allergen-Verknüpfungen neu setzen;
  `revalidatePath('/biergarten'|'/admin')`). Client-UI `components/admin/MenuAdmin.tsx`
  (Bereichs-Umschalter — nur Biergarten aktiv; Kategorien mit Inline-Rename + Hoch/Runter +
  Löschen-mit-Rückfrage; Gericht-Editor mit Name/Preis/Beschreibung, Tag- & Allergen-
  Checkboxen im Klartext, „Verfügbar"-Schalter, Speichern-Feedback). Styles in `globals.css`
  (`.admin-*`, token-konform). **End-to-end vom Nutzer bestätigt** (2026-07-03): Allergen
  setzen → `(A, G)` + Legende auf `/biergarten`; „Verfügbar" aus → Gericht öffentlich weg,
  im Admin sichtbar; anlegen/bearbeiten/verschieben/löschen funktionieren.

**Nächster Schritt — Phase 6 (Abschluss & Doku), sofort startbar:**
1. Security-Checks: `grep -rn "service_role" web/` muss **leer** sein · Supabase-Advisors clean
   (MCP `get_advisors` bzw. `supabase db advisors`) · `admins` anonym nicht lesbar · RLS auf
   allen Tabellen (schon in Phase 2 bestätigt, gegenprüfen).
2. `web/TODO.md` pflegen: Menü-Backend als erledigt markieren; Punkt #1 (Telefonnummer aus
   `site_settings`) und #5 (Öffnungszeiten/Backstube) sind **nicht** Teil davon → offen lassen.
3. `npm run build` grün halten (Typecheck + Lint). ⚠️ **Nie `npm run build` parallel zu einem
   laufenden `next dev` fahren** — beide teilen `.next`, das zerschießt den Dev-Cache
   (`__webpack_modules__[moduleId] is not a function`); dev vorher stoppen, sequenziell bauen.
4. Optionales Folge-TODO notieren: eigener SMTP-Absender über `kurvenbeck.com` (Supabase-
   Standard-Mailversand hat niedriges Limit).

**Danach — Folgeschritte (nicht Phase 6):** Backstube an dasselbe Backend andocken
(`area='backstube'`, ohne Fotos, gleiche Admin-UI), Catering, Drag&Drop-Sortierung, SMTP.
Details/Spezifikation: `web/plans/biergarten-menu-backend.md`.

**Hinweis für neue Session:** Schema-Änderungen laufen über den **Supabase-MCP** (muss neu
autorisiert werden, falls die Verbindung getrennt wurde). Phase 3 selbst braucht keinen MCP —
nur die App liest über den Publishable-Key.

**Offen (nicht Menü-Backend):** `npm audit` meldet Schwachstellen in **Next.js 15.1.6**
(u. a. Middleware-SSRF) → separates Update auf Next 15.5.x empfohlen, siehe `web/TODO.md`.
