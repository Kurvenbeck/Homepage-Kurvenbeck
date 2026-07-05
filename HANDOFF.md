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
  siehe §10. Biergarten **und Backstube** lesen ihre Karte live aus der DB und werden
  im Admin gepflegt. Das Catering-Formular ist weiterhin eine Demo.

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
├─ middleware.ts          # Session-Refresh + Route-Schutz /admin/* → Login
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

**Menü-Backend (live):** Biergarten- **und Backstube**-Karte lesen dynamisch aus Supabase
und werden unter `/admin` (Bereichs-Tabs) selbst gepflegt — siehe §10. **Admin-Feinschliff
(2026-07-05):** Save-Button je Eintrag zeigt **grün „Gespeichert" ↔ rot „Speichern"**
(Dirty-Status gegen den Live-Stand); Kategorie-Löschen fragt mit Anzahl der betroffenen
Einträge nach.

**Demos (noch ohne Backend):**
- **Catering-Formular** — Client-Validierung + Erfolgszustand, aber kein echter Versand.
- **Backstube-Warenkorb-Komponenten** (`components/cart/*`) — voll bedienbar inkl.
  Persistenz, aber auf der Seite **nicht mehr eingebunden** (Backstube ist jetzt Text-Menü);
  aufbewahrt für den späteren echten Checkout (TODO #4).

**Platzhalter:** noch fehlende Fotos (Biergarten/Home-Karten teils offen, siehe
`web/public/images/README.md`), Inhalte (Adresse/Öffnungszeiten), Rechtstexte.
⚠️ **Telefonnummer in `web/lib/siteSettings.ts` ist ein Platzhalter (`07071 / 12 34 56`)
und darf nicht live gehen** — echte Nummer bzw. Backend-Anbindung zuerst (§11, TODO #1).

## 8. Nächste Schritte

Vollständig priorisiert in **`web/TODO.md`**; die durchgesprochenen Entscheidungen stehen
in **§11**. Kompakt (Stand 2026-07-05):

1. **Kontaktdaten & Öffnungszeiten ins Backend** (höchste Prio): Telefon/Adresse aus
   `site_settings`, Öffnungszeiten als Besenwirtschaft-Termine (`opening_days`) + „Heute
   geöffnet/geschlossen"-Badge. ⚠️ Platzhalter-Telefonnummer darf nicht live gehen.
2. **Catering-Formular echt machen:** Server Action + Supabase-Speicherung + Admin-Posteingang
   + E-Mail via Hostinger-SMTP (`kontakt@kurvenbeck.com`, „Weg B" — Zugangsdaten offen).
3. **Backstube-Vorbestellen** (Konzept festgehalten, §11): Warenkorb → Bestellung → Admin mit
   Einzelbestellungen **und** aggregierter Backliste. Braucht das Termin-Backend aus #1.
4. **„Empfehlung des Hauses"** (erledigt). Kennzeichnungen (vegetarisch/vegan/alkoholfrei)
   bleiben bewusst **Text** — keine Icons.
5. Recht/Begriffe/Metadaten: Titelschutz durchziehen, „seit 1978" klären, Rechtstexte füllen.
6. Local-SEO (ohne „Bakery"), restliche Fotos, Next.js-Update, Repo-Umzug.

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

- ✅ **Phase 6 — verifiziert** — Abschluss & Doku (2026-07-03).
  - **Security-Checks sauber:** `grep -rn "service_role" web/` (ohne node_modules) liefert nur
    zwei erklärende Kommentare („kein service_role in der App") — **kein echter Key im Code**.
    RLS auf **allen** 5 Tabellen aktiv (`admins`, `menu_categories`, `menu_items`, `allergens`,
    `menu_item_allergens`). Supabase Security-Advisors: nur **eine** Warnung
    „Leaked Password Protection Disabled" — **irrelevant**, da passwortloser Magic-Link-Login
    (keine Passwörter im Spiel). `admins` anonym nicht lesbar (Phase 2 getestet).
  - `web/TODO.md` gepflegt: Menü-Backend als erledigt markiert; #1 (Telefon aus `site_settings`)
    und #5 (Öffnungszeiten/Backstube) bleiben offen.
  - `npm run build` grün (13 Seiten, `/admin`+`/auth/confirm`+`/biergarten` korrekt dynamisch).
  - **Offenes Folge-TODO:** eigener SMTP-Absender über `kurvenbeck.com` (Supabase-
    Standard-Mailversand hat niedriges Limit) — in `web/TODO.md` notiert.

- ✅ **Backstube angedockt (2026-07-03)** — Die Backstube nutzt jetzt dasselbe Menü-Backend
  (`area='backstube'`, Text-Format ohne Fotos). Konkret:
  - **Seed** `supabase/migrations/20260703151500_backstube_seed.sql` — 2 Kategorien
    („Laugengebäck & Brötchen", „Brot & Süßes"), 6 Backwaren 1:1 aus dem alten statischen
    `lib/products.ts`. Bewusst **ohne** vorbelegte Tags/Allergene (rechtlich sensibel → pflegt
    der Kunde selbst im Admin).
  - **Server Actions** (`app/admin/actions.ts`) sind jetzt **area-parametrisiert**; neue
    Whitelist `lib/menuAreas.ts` (`MENU_AREAS`, `assertArea`) begrenzt Schreibziel &
    Revalidierung auf `biergarten` | `backstube` (getrennte Datei, weil `"use server"` nur
    async Exports erlaubt).
  - **Admin-UI** (`components/admin/MenuAdmin.tsx`): Bereichs-Tabs Biergarten/Backstube sind
    jetzt aktive Links (`/admin?area=…`); `app/admin/page.tsx` liest & validiert `?area=`.
    Copy je Bereich („Gericht" vs. „Backware").
  - **Öffentliche Seite** `app/backstube/page.tsx` zeigt jetzt das Text-Menü aus Supabase
    (async + `force-dynamic`, gleiche `.menu-*`-Markup wie Biergarten), Warenkorb-Demo
    entfernt; Header-CTA → WhatsApp-Vorbestellung. **Hinweis:** Die Warenkorb-Komponenten
    (`components/cart/*`, `lib/products.ts`) bleiben absichtlich im Repo (nicht mehr
    importiert) — Wiederverwendung für den späteren echten Checkout (TODO #4).
  - Build grün (12 Seiten, `/backstube` jetzt dynamisch), live gegen DB verifiziert
    (6 Backwaren + Preise), `/admin` weiterhin auth-geschützt (307 → Login), Security-Advisors
    unverändert sauber.

**Danach — Folgeschritte:** Catering ans Backend andocken, Drag&Drop-Sortierung, eigener
SMTP-Absender. Details/Spezifikation: `web/plans/biergarten-menu-backend.md`.

**Hinweis für neue Session:** Schema-Änderungen laufen über den **Supabase-MCP** (muss neu
autorisiert werden, falls die Verbindung getrennt wurde). Phase 3 selbst braucht keinen MCP —
nur die App liest über den Publishable-Key.

**Erledigt (2026-07-05):**
- **Kontaktdaten im Backend:** Tabelle `site_settings` (+ RLS), Loader `lib/getSiteSettings.ts`
  (server) / `lib/siteSettings.ts` (client-sicher, Fallback), Admin-Tab „Einstellungen"
  (`/admin/einstellungen`). Footer + Biergarten/Backstube-CTAs lesen live. Echte Nummer/Adresse
  trägt der Betreiber selbst ein (Platzhalter bis dahin).
- **Empfehlung des Hauses:** Flag `is_recommendation` am Menü-Eintrag, im Admin schaltbar;
  hervorgehoben auf Biergarten/Backstube, aus der normalen Liste herausgelöst
  (`components/MenuRecommendations.tsx`).
- **Sicherheitsupdate:** **Next 15.1.6 → 15.5.20** + postcss-`overrides` → `npm audit` = 0.

---

## 11. Beschlossene Roadmap & Entscheidungen (Durchsprache 2026-07-05)

Festgehalten, damit nichts aus der Abstimmung verloren geht. Operative Checklisten dazu
stehen in `web/TODO.md`; hier die **Entscheidungen und ihr Warum**.

### Begriffe & Recht (verbindlich)
- **Titelschutz:** Der Betrieb ist eine **Backstube**, **keine „Bäckerei"**; der Betreiber
  ist **kein gelernter „Bäcker"**. In **allen** Texten/Labels/Alt-Texten/Metadaten die Wörter
  „Bäcker"/„Bäckerei" **vermeiden** → „Backstube", „aus dem Ofen", „von Hand gebacken";
  Person = „Betreiber/Familie/Team". (Auch in CLAUDE.md verankert.)
- **„seit 1978"** steht aktuell **live** in `app/layout.tsx` (Meta-/OG-Beschreibung, 2×) und
  in CLAUDE.md/README. Die Backstube existiert erst ~1,5 Jahre → **noch offen: klären, ob die
  Jahreszahl für den Gesamtbetrieb stimmt**, sonst entfernen. Bis dahin nicht bewerben.

### Kontaktdaten & Öffnungszeiten → ins Backend (Prio 1)
- **Telefon/Adresse** aus `site_settings`, vom Betreiber im Admin pflegbar. Aktuelle Nummer
  ist ein **Platzhalter** und darf nicht live gehen.
- **Öffnungszeiten = Besenwirtschaft:** unregelmäßige Tage, **nicht** „immer Sa/So". Der
  Betreiber trägt konkrete Termine ein (**Wochentag + Datum + Uhrzeit von–bis**), die Seite
  zeigt daraus verständlich z. B. „Heute ab 11 Uhr geöffnet · Sonntag, 5. Juli · 11–22 Uhr"
  bzw. „Heute geschlossen — nächster Öffnungstag …".
  ✅ **Gebaut (2026-07-05):** Tabelle `opening_days` (+ RLS wie Menü-Tabellen), Loader
  `lib/openingHours.ts` (Zeitzone Europe/Berlin, „jetzt geöffnet"-Logik), dynamischer Badge
  auf `app/biergarten/page.tsx` (grüner Punkt = jetzt offen), Admin-Verwaltung unter
  **`/admin/oeffnungszeiten`** (`OpeningHoursAdmin` + `AdminNav`-Umschalter). Server Actions
  `app/admin/opening-actions.ts` (area-validiert, Datum/Zeit geprüft, open < close).
  Aktuell **Beispieldaten** geseedet (05./11./12. Juli) — im Admin durch echte Termine ersetzen.
  Offen: Badge evtl. auch auf der Startseite; Backstube-„Backtage" später separat.

### Catering-Formular echt machen (Prio 2)
- Server Action + serverseitige Validierung; Anfrage in Supabase (`catering_requests`).
- **Catering-Posteingang im Admin** (eigener Tab, „neu/erledigt") — definitiv gewünscht.
- **E-Mail-Versand = „Weg B":** über **SMTP des Hostinger-Postfachs `kontakt@kurvenbeck.com`**
  (alles läuft bei **Hostinger**). SMTP-Zugangsdaten **liegen noch nicht vor** → offen; kommen
  ausschließlich in `web/.env.local`, **nie committen**. Bis dahin kann der Posteingang schon
  ohne Mailversand gebaut werden.

### Backstube: echtes Online-Vorbestellen (Konzept, kommt nach dem Termin-Backend)
- Aktueller Ablauf **bleibt gültig**: Backtag wird angekündigt (WhatsApp/Mundpropaganda/Home),
  Bestellung bis z. B. Fr 18 Uhr, Abholung Sa 8 Uhr. Backstube-Seite = Text-Menü + WhatsApp.
- **Vision:** Gast legt Mengen in den **Warenkorb** (z. B. 5 Brezeln, 3 Körnerwecken, 7 Briegl),
  schickt ab → „Bestellung eingegangen"; **E-Mail-Bestätigung nur, wenn E-Mail angegeben**;
  **kein WhatsApp** (kostet).
- **Admin — zwei Sichten:** (1) **pro Bestellung** mit Name + Positionen; (2) **aggregierte
  Backliste** über alle Bestellungen (z. B. „Brezeln 112 · Körnerwecken 40 · Briegl 88") —
  das ist das **Killer-Feature** für die Backvorbereitung.
- **Bausteine da:** Warenkorb-Komponenten (`components/cart/*`) bewusst erhalten; Sortiment im
  Menü-Backend. **Abhängigkeit:** Backtag/Abholtag-Logik → baut auf dem Termin-Backend (Prio 1) auf.

### Menü-Verbesserungen
- **„Empfehlung des Hauses":** hervorgehobener Sonder-Eintrag, der sonst **nicht** auf der Karte
  steht (z. B. spontaner Schweinebraten). Flag/Feld am Eintrag + Hervorhebung; im Admin schaltbar.
- **Kennzeichnungen bleiben Text** (vegetarisch/vegan/alkoholfrei) — **keine Icons**
  (Entscheidung 2026-07-05).
- **Druckbare Tisch-Speisekarte (Biergarten, Entscheidung 2026-07-05):** Gäste am Tisch brauchen
  eine Karte. Lösung = **Druck-Ansicht** (eigene Route + `@media print`-A4-CSS, live aus der DB),
  **auth-geschützt unter `/admin/...`** (nur der eingeloggte Betreiber), die er per Button öffnet
  und über den Browser druckt bzw. „als PDF sichert" —
  **keine** serverseitige PDF-/Word-Erzeugung (keine schweren Libs, immer aktuell, markengetreu).
  Auf der Karte ein **QR-Code** → `kurvenbeck.com/biergarten`. Details: `web/TODO.md` #4b.
- **Backstube bleibt bewusst ohne Produktfotos** (Text-Format wie Biergarten).

### Admin-UX
- ✅ **Erledigt:** Save-Status grün/rot (deckungsgleich mit Live ↔ ungespeichert),
  Löschen mit Anzahl-Rückfrage.
- Hoch/Runter-Sortierpfeile bleiben vorerst (Drag&Drop später, „schauen wie wir es leben").
- Offen: Handy-Tauglichkeit des Admin prüfen (Betreiber pflegt vermutlich vom Smartphone).

### Local-SEO
- Erwünscht, aber **kein `Bakery`-Schema** (Titelschutz) — passenderer `schema.org`-Typ
  (z. B. `Restaurant`/`FoodEstablishment`) mit Adresse/Öffnungszeiten/Geo; `sitemap.xml`,
  `robots.txt`, Google-Business-Profil.
