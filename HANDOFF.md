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
  im Admin gepflegt. Das **Catering-Formular speichert** jetzt echt in Supabase
  (`catering_requests`) + Admin-Posteingang `/admin/catering`; **E-Mail-Versand läuft** (Admin-
  Benachrichtigung + Gast-Bestätigung, Hostinger-SMTP über `lib/mail.ts`).

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
│  └─ impressum|datenschutz|agb/   # Datenschutz mit echtem Text (2026-07-06);
│                                   # Impressum + AGB noch Platzhalter
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
- **Kontaktdaten:** Telefon, Adresse **und E-Mail** **nicht hardcoden** — einzige Quelle
  ist die Supabase-Tabelle `site_settings` (Keys `contact_phone_display`,
  `contact_phone_e164`, `contact_email`, `contact_address`), geladen über
  `lib/getSiteSettings.ts` / client-sicher `lib/siteSettings.ts`.
  `telHref`/`whatsappHref`/`mailtoHref` werden daraus abgeleitet (Footer +
  Biergarten-CTAs + Backstube-Banner nutzen sie). Im Admin unter `/admin/einstellungen`
  pflegbar. Neue Kontaktangaben als weiteren `site_settings`-Key ergänzen.
- **Footer-Einbindung — verbindliche Regel (seit 2026-07-09):** Jede Server-Komponenten-Seite
  bindet den Footer über **`<SiteFooterServer />`** (`components/SiteFooterServer.tsx`) ein,
  **nie** `<SiteFooter />` direkt ohne `contact`-Prop. `SiteFooterServer` zieht die
  Kontaktdaten selbst über `getSiteSettings()` (jetzt mit `cache()` gewrappt, damit mehrere
  Aufrufe pro Request nicht mehrfach die DB treffen). Grund: Bug am 2026-07-09 gefunden —
  Impressum/Datenschutz/AGB (`LegalPage.tsx`) riefen `<SiteFooter />` ohne `contact` auf und
  zeigten dadurch die Platzhalter-Adresse/-Telefonnummer statt der echten Daten.
  **Nachgezogen (2026-07-14):** derselbe Bug war auch auf `/admin/login` — die Seite ist eine
  Client-Komponente (`"use client"`, wegen `signInWithOtp`) und konnte `SiteFooterServer`
  (async Server-Komponente) nicht direkt rendern, zeigte also die Platzhalter-Kontaktdaten
  selbst nach dem Login. Fix: `app/admin/login/page.tsx` ist jetzt ein schlanker async
  Server-Wrapper, der `getSiteSettings()` lädt und an die neue Client-Komponente
  `components/admin/AdminLoginForm.tsx` (enthält das Formular + `<SiteFooter contact={…} />`)
  durchreicht — keine Client-Komponente mehr, die `<SiteFooter />` ohne `contact` rendert.
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

**Catering-Anfragen (live, Stand 2026-07-06/07):** Formular speichert echt in Supabase
(`catering_requests`, RLS: anon nur INSERT, Lesen/Ändern nur Admin) + Honeypot-Spamschutz;
Posteingang unter `/admin/catering` (Tab „Anfragen - Catering", neu↔erledigt). **E-Mail-Versand live:**
Benachrichtigung an `kontakt@kurvenbeck.com` + Bestätigungsmail an den Gast (Hostinger-SMTP,
`lib/mail.ts`). Die 4 Beispiel-Kacheln auf der Seite zeigen nur noch Foto/Titel/Beschreibung
(kein „Menü ansehen", kein Preis/Gästezahl-Hinweis mehr).

**Backstube-Vorbestellen (live, Stand 2026-07-07) — das „Killer-Feature":** Gäste legen Mengen
in den Warenkorb und bestellen direkt auf der Backstube-Seite (kein WhatsApp) für den aktuell
aktiven **Backtag** (ein global aktiver Backtag in `site_settings`, im Admin schaltbar). Bestellung
in Supabase (`backstube_orders`, RLS wie Catering: anon nur INSERT gehärtet, Lesen/Ändern nur Admin;
Positionen als JSONB-Snapshot). Bestellzeilen-UI überarbeitet (2026-07-06/07, Kundenfeedback):
editierbares Mengenfeld, saubere Preis-/Aktions-Spalten, größere Klickziele, Mobile-Layout eigens
verifiziert. **E-Mail-Bestätigung an den Gast gebaut (2026-07-07):** `submitBackstubeOrder`
verschickt bei angegebener E-Mail eine Bestätigungsmail (Positionen, Summe, Abholtag) über
`lib/mail.ts` — bewusst **ohne** Admin-Mail pro Bestellung (eine aggregierte Zusammenfassung nach
Bestellschluss wurde durchgesprochen und verworfen, da der Betreiber den Backtag manuell abschließt).

**Rezepte, Zutaten-Bedarf & Bestellungen-Umbau (2026-07-07):** Jede Backware kann bis zu **10 Zutaten**
(Rezept) bekommen — angelegt **an einem Ort** (Speisekarte → Backstube, direkt im Ware-Editor; keine
Doppelpflege). Zutaten sind zentrale **Stammdaten** (`backstube_ingredients`, Name case-insensitive
eindeutig + feste Einheit), pro Rezept nur per Dropdown gewählt → Aggregation läuft über die Zutat-ID
(kein „Wasser"-Doppel). Admin `/admin/bestellungen` ist jetzt in **3 Unter-Reiter** gegliedert
(`components/admin/BestellungenTabs.tsx`): **Backtag** · **Backliste & Zutaten** (aggregierte Backliste
über alle offenen Bestellungen + je Backware hochgerechnete Zutaten + **Gesamt-Einkaufsliste des Tages**
+ Drucken) · **Bestellungen** (Einzelbestellungen mit **Namens-Suche**; **offen oben, erledigt unten**
sortiert — Abhaken schiebt live nach unten). Rezeptmengen sind **interne Betriebsdaten**: die Tabellen
`backstube_ingredients` + `menu_item_ingredients` sind **admin-only** (Lesen *und* Schreiben),
Migration `20260707100000_backstube_recipes_schema.sql`. Details: §11. **Offen:** die eingeloggte
Admin-UI dieser Panels ist noch nicht klick-getestet (braucht Magic-Link-Login) — Typen/Imports/
DB-Logik sind verifiziert.

**Datenschutzerklärung (live, Stand 2026-07-06):** `app/datenschutz/page.tsx` mit echtem Text
(Basis: vom Kunden gelieferter Datenschutz-Generator.de-Text, gegen den Code abgeglichen und
ergänzt). Nennt Vercel (Hosting) + Supabase (Backend, Server in `eu-central-1`/Frankfurt) als
Auftragsverarbeiter, beschreibt Catering-Anfrage und Backstube-Vorbestellung als eigene
Verarbeitungsvorgänge inkl. Löschfristen, erklärt den Supabase-Admin-Login-Cookie sowie den
`localStorage`-Warenkorb (beide technisch notwendig, **kein** Cookie-Banner nötig — keine
Tracking-/Analyse-Cookies im Einsatz) und enthält den zuvor fehlenden Abschnitt „Rechte der
betroffenen Personen". **Löschfristen automatisiert:** Migration
`20260706150000_retention_cron_jobs.sql` — zwei `pg_cron`-Jobs löschen täglich nachts
Catering-Anfragen 60 Tage nach Wunschdatum bzw. Backstube-Bestellungen 7 Tage nach Backtag
(Fallback jeweils Eingangsdatum, falls kein Datum gesetzt ist); in `cron.job` als aktiv
verifiziert. **Impressum (live, Stand 2026-07-08):** `app/impressum/page.tsx` mit echten Angaben — Kurvenbeck
GmbH, Im Hetzenloch 3, 89558 Böhmenkirch-Schnittlingen, Geschäftsführer Johannes Wehner,
USt-IdNr. `DE455026608`, `kontakt@kurvenbeck.com`. **Offen:** Handelsregisternummer +
Registergericht fehlen noch (im Text als „wird nachgetragen" markiert) — sobald der Eintrag
vorliegt, in `app/impressum/page.tsx` ergänzen.

**AGB (live, Stand 2026-07-08):** `app/agb/page.tsx` mit dem Text aus
`Rechtliche Dokumente/AGB_Kurvenbeck_Anwaltsversion_V2.docx` (15 Paragrafen: Anbieter,
Geltungsbereich, Catering-Vertragsschluss, Leistungsumfang, Personenzahl, Preise/Zahlung,
Stornierungsstaffel, Leihgeschirr, Backstube-Vorbestellung, Widerrufsausschluss, Allergene,
höhere Gewalt, Fotoaufnahmen, Haftung, Schlussbestimmungen). **Bewusst nicht übernommen:** der
Dokument-Abschnitt „Hinweise für die anwaltliche Prüfung" (interne Prüfhinweise für den Anwalt,
nicht für die öffentliche Seite bestimmt). ⚠️ **Das Ausgangsdokument ist als „Entwurf zur
anwaltlichen Prüfung" gekennzeichnet** — vor Go-Live sollte der Kunde bestätigen, dass die
anwaltliche Prüfung abgeschlossen ist.

**Demos (noch ohne Backend):**
- **Backstube-Warenkorb-Komponenten** (`components/cart/*`) — voll bedienbar inkl.
  Persistenz, aber auf der Seite **nicht mehr eingebunden** (Backstube ist jetzt Text-Menü);
  aufbewahrt für den späteren echten Checkout (TODO #4).

**Platzhalter:** noch fehlende Fotos (Biergarten/Home-Karten teils offen, siehe
`web/public/images/README.md`), Inhalte (Adresse/Öffnungszeiten), Impressum + AGB
(Datenschutz ist bereits echt, siehe §7).
✅ **Echte Kontaktdaten stehen im Backend** (`site_settings`, Stand 2026-07-06/08): Telefon
`0151 / 2222 1396`, Adresse Im Hetzenloch 3, 89558 Böhmenkirch-Schnittlingen, E-Mail
`kontakt@kurvenbeck.com` — Footer/CTAs zeigen sie live. Der `FALLBACK_CONTACT` in
`web/lib/siteSettings.ts` (`07071 / 12 34 56`, Musterstadt) greift nur, wenn die DB nicht
erreichbar ist — er darf so bleiben, geht aber nicht live in Erscheinung.

## 8. Nächste Schritte

Vollständig priorisiert in **`web/TODO.md`**; die durchgesprochenen Entscheidungen stehen
in **§11**. Kompakt (Stand 2026-07-07):

1. ✅ **Impressum + AGB mit echten Angaben live** (2026-07-08) — beim Impressum fehlt nur noch
   **Handelsregisternummer + Registergericht** (nachtragen, sobald der Eintrag vorliegt); die
   AGB stammen aus dem Anwaltsentwurf (`Rechtliche Dokumente/`) und sind laut Dokument noch als
   **Entwurf zur anwaltlichen Prüfung** gekennzeichnet — Freigabe beim Kunden erfragen.
2. ✅ **Echte Kontaktdaten stehen im Backend** (Telefon `0151 / 2222 1396`, Adresse Im Hetzenloch 3,
   E-Mail `kontakt@kurvenbeck.com`) — nur noch gegen die echten Angaben gegenprüfen, kein Blocker mehr.
3. **Google-Business-Profil verlinken** (NAP-Konsistenz) — Kundentermin war am 2026-07-06.
4. **Vercel-Deployment durchführen** (Hoster entschieden) + Supabase Auth-URLs von localhost auf
   die echte Domain umstellen (Go-Live-Checkliste, `web/TODO.md` #11).
5. Repo-Umzug in die Kurvenbeck-Org, restliche Fotos, kleinere Feinschliff-Punkte.

**Bereits erledigt (nicht mehr offen):** Kontaktdaten-/Öffnungszeiten-Backend, Catering-Formular
inkl. **E-Mail-Versand** (Admin-Benachrichtigung + Gast-Bestätigung, seit 2026-07-06/07 live),
Backstube-Vorbestellen inkl. UI-Feinschliff **und Gast-Bestätigungsmail** (2026-07-07),
„Empfehlung des Hauses", Titelschutz, „seit 1978" entfernt, Datenschutzerklärung mit
automatischer Löschung, Local-SEO (JSON-LD, Sitemap, Robots), Catering-Kacheln bereinigt (kein
totes „Menü ansehen" mehr).

## 9. Deployment (Hoster entschieden, Deployment noch offen)

**Entscheidung (2026-07-06): Vercel.** Deployment selbst steht noch aus. Vor dem ersten Deploy:
die Supabase-ENV (siehe §10) im Host hinterlegen; `.env.local` ist git-ignoriert — Keys niemals
committen.

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
  `@supabase/ssr` PKCE nutzt), öffentliche Registrierung aus. **Auth-User (Stand 2026-07-09):**
  zwei Konten — `ihringmichael@gmail.com` und `kontakt@kurvenbeck.com` (beide in `admins`,
  beide confirmed, Login getestet). Detail-Fallstrick in Projekt-Memory `kurvenbeck-admin-auth`:
  Auth-User **nie** manuell per SQL in `auth.users` anlegen (GoTrue braucht leere Strings statt
  NULL in den Token-Spalten → sonst „500: Database error finding user"); nutze Dashboard → Auth
  → Users.

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

**Erledigt (2026-07-12):**
- **Getränke mit zwei Größen (eine Zeile statt Dopplung):** Statt „Spezi 0,2 l" und
  „Spezi 0,4 l" als zwei Menüeinträge anzulegen, bekommt jedes Getränk in der Kategorie
  „Getränke" optional zwei Größen-Spalten mit frei editierbarem Label (z. B. „0,2 l" /
  „0,4 l") und je eigenem Preis. Migration `20260712080000_menu_item_drink_sizes.sql`
  (3 nullable Spalten `size1_label`/`size2_label`/`size2_price` auf `menu_items`, keine
  RLS-Änderung nötig). Nur in der Kategorie „Getränke" sichtbar (Titel-Check im Admin-
  Editor); Einträge/Kategorien ohne zweite Größe sehen exakt wie vorher aus (Ein-Preis-
  Fallback). Anzeige auf `/biergarten`, der Druck-Speisekarte und bei „Empfehlung des
  Hauses" aktualisiert. `lib/menu.ts` (`MenuItem`/`AdminMenuItem` um `sizeLabel`/
  `secondSize` erweitert), `app/admin/actions.ts` (`updateItem`), `MenuAdmin.tsx`.

---

## 11. Beschlossene Roadmap & Entscheidungen (Durchsprache 2026-07-05)

Festgehalten, damit nichts aus der Abstimmung verloren geht. Operative Checklisten dazu
stehen in `web/TODO.md`; hier die **Entscheidungen und ihr Warum**.

### Begriffe & Recht (verbindlich)
- **Titelschutz:** Der Betrieb ist eine **Backstube**, **keine „Bäckerei"**; der Betreiber
  ist **kein gelernter „Bäcker"**. In **allen** Texten/Labels/Alt-Texten/Metadaten die Wörter
  „Bäcker"/„Bäckerei" **vermeiden** → „Backstube", „aus dem Ofen", „von Hand gebacken";
  Person = „Betreiber/Familie/Team". (Auch in CLAUDE.md verankert.)
  ✅ **Geprüft (2026-07-06):** Live-Code + DB-Inhalte (Menü, `site_settings`, Öffnungstage,
  Catering-Anfragen) systematisch durchsucht — keine Treffer, Titelschutz sauber.
- **„seit 1978" entfernt (2026-07-06, endgültig):** war in `app/layout.tsx` (Meta-/OG-
  Beschreibung, 2×) sowie in CLAUDE.md und den `*.html`-Design-Referenzen. Die Backstube
  existiert erst ~1,5 Jahre, die Jahreszahl passt nicht zum Gesamtbetrieb → **komplett entfernt**,
  nicht nur zurückgehalten. Darf nicht wieder eingeführt werden.

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
  ✅ **Erweitert (2026-07-06):** Öffnungsstatus jetzt zusätzlich **prominent im Hero der Startseite**
  (`OpeningStatusView`, neue Variante `hero`) statt nur in der Biergarten-Kachel — Begründung: „ist
  offen?" ist der erste Gedanke eines Landingpage-Besuchers. Zeigt Status + bis zu 3 künftige
  Öffnungstage (`OpeningStatus.upcoming`, `lib/openingHours.ts`), rollt automatisch weiter. Zusätzlich
  **Events**: Öffnungstage im Admin als „Besonderes Event" markierbar (`is_event`/`event_title`,
  Migration `20260706100000_opening_days_event_fields.sql`, z. B. Live-Musik) — erscheinen unabhängig
  von der 3-Tage-Vorschau in einem separaten **Event-Banner** (`components/EventBanner.tsx`) auf der
  Startseite. Backstube-„Backtage" bleiben separat (eigenes Modell in `site_settings`).

### Catering-Formular echt machen (Prio 2)
✅ **Gebaut (2026-07-05):** Server Action `app/catering/actions.ts` (`submitCateringRequest`) mit
serverseitiger Validierung + Honeypot; Anfrage in Supabase (`catering_requests`, RLS: anon nur
INSERT mit gehärtetem `WITH CHECK`, Lesen/Ändern nur `is_admin()`). **Posteingang im Admin**
`/admin/catering` (Tab „Anfragen - Catering", neu↔erledigt) — Loader `lib/catering.ts`, Status-Action
`app/admin/catering-actions.ts`, UI `components/admin/CateringInbox.tsx`. Build grün, RLS + Advisors
verifiziert.
- ✅ **E-Mail-Versand (gebaut 2026-07-06/07):** SMTP-Zugangsdaten liegen jetzt vor
  (`smtp.hostinger.com:465`, `kontakt@kurvenbeck.com`) und sind in `web/.env.local` eingetragen.
  Zentraler Helper `web/lib/mail.ts` (`nodemailer`, Absendername „Kurvenbeck Homepage"):
  `sendNotificationMail()` verschickt bei jeder neuen Anfrage eine Benachrichtigung an
  `kontakt@kurvenbeck.com` (Reply-To = Anfragende E-Mail), `sendMailTo()` verschickt zusätzlich eine
  Bestätigungsmail an den Gast („Wir haben deine Anfrage erhalten" + eingegebene Angaben). Beide
  HTML-Templates escapen Nutzereingaben (XSS-Schutz). SMTP-Verbindung + Testversand live verifiziert.
  Fehlt SMTP oder schlägt der Versand fehl, wird nur geloggt — blockiert nie das Speichern der
  Anfrage. Optional weiterhin offen: serverseitiges Rate-Limit (Honeypot deckt einfache Bots ab).
- ✅ **Catering-Kacheln bereinigt (2026-07-06, Kundenfeedback):** Die 4 Beispiel-Kacheln
  (`app/catering/page.tsx`) zeigten „Menü ansehen →" (führte ins Leere, wird es nie geben — Menü ist
  immer individuelle Absprache) sowie Preis-pro-Person/Mindestgästezahl. Beides entfernt, Kacheln
  zeigen nur noch Foto + Titel + Beschreibung; einzige Aktion bleibt das Anfrageformular unten.
  Hover-Effekt der Kacheln (`.cat-card`) auf denselben Stil wie die Startseiten-Kacheln (`.hcard`)
  angeglichen (stärkerer Schatten + `translateY(-3px)`).

### Backstube: echtes Online-Vorbestellen ✅ (gebaut 2026-07-05 — das „Killer-Feature")
- **Backtag-Modell (Entscheidung 2026-07-05): EIN global aktiver Backtag** in `site_settings`
  (`backtag_active`/`backtag_date`/`backtag_deadline_text`/`backtag_pickup_text`) — der Betreiber
  schaltet ihn im Admin ein/aus und setzt nach jedem Backtag den nächsten. Bewusst **keine** eigene
  Termintabelle → keine Abhängigkeit zum Öffnungszeiten-Backend.
- **Gast-Flow:** Warenkorb (menügetrieben, live aus der DB), Vorbestellung mit Name (E-Mail/Telefon
  optional) → „Bestellung eingegangen". **Kein WhatsApp.** Ist kein Backtag aktiv, zeigt die Seite
  „Aktuell kein Backtag" und niemand kann bestellen.
- **Fallback ohne Backtag (2026-07-08):** Der „kein Backtag"-Hinweis auf der Backstube-Seite
  verlinkt jetzt auf `/catering#anfrage` (springt direkt zum Anfrageformular) mit dem Text
  „schick uns deine Anfrage … wir melden uns innerhalb von 48 Stunden". Die 48-Stunden-Zusage
  ist konsistent mit Catering-Seite, Formular-Erfolgstext **und** Catering-Bestätigungsmail
  (`app/catering/actions.ts`).
- **Admin `/admin/bestellungen` — 3 Unter-Reiter** (`components/admin/BestellungenTabs.tsx`, seit
  2026-07-07): (1) **Backtag** (Backtag-Pflege, grün/rot Save) · (2) **Backliste & Zutaten** —
  aggregierte Backliste über alle offenen Bestellungen (das Killer-Feature) + je Backware
  hochgerechnete Zutaten + Gesamt-Einkaufsliste des Tages + Drucken · (3) **Bestellungen** —
  Einzelbestellungen mit Name + Positionen + Status neu↔erledigt, **Namens-Suche**, **offen oben /
  erledigt unten** sortiert (Abhaken schiebt live nach unten).
- **Sicherheit/Umsetzung:** Tabelle `backstube_orders` (RLS wie Catering: anon nur INSERT gehärtet,
  Lesen/Ändern nur `is_admin()`), Positionen als **JSONB-Snapshot** (Name+Einzelpreis zum
  Bestellzeitpunkt). Server Action übernimmt **Preise/Namen autoritativ aus dem Live-Menü**.
  Dateien: Migration `..._190000_backstube_orders_schema.sql`, `lib/backtag.ts`/`lib/getBacktag.ts`,
  `lib/backstubeOrders.ts`, `app/backstube/order-actions.ts`, `app/admin/order-actions.ts`,
  `components/backstube/BackstubeOrder.tsx`, `components/admin/BacktagAdmin.tsx` +
  `components/admin/OrdersInbox.tsx`. Verifiziert: Build grün, RLS (201/401/42501), beide Seiten-
  zustände gerendert, Advisors sauber.
- ✅ **E-Mail-Bestätigung an den Gast (gebaut 2026-07-07):** `app/backstube/order-actions.ts`
  (`submitBackstubeOrder`) verschickt nach erfolgreichem Insert — nur wenn eine E-Mail angegeben
  wurde — eine Bestätigungsmail über `sendMailTo()` (`lib/mail.ts`): Positionen (Menge × Name,
  Einzelsumme), Gesamtsumme, Abholtag (`backtag.dateLabel`) + Abholtext. Analog zum
  Catering-Template (eigenes HTML mit Escaping gegen Injection), aber **bewusst keine**
  Admin-Benachrichtigung pro Bestellung an `kontakt@kurvenbeck.com` — das würde bei mehreren
  Bestellungen pro Backtag zu viel Rauschen erzeugen. Eine **aggregierte
  Zusammenfassungs-Mail** nach Bestellschluss (z. B. „730× Brezel, 500× Körnerwecken …") wurde
  durchgesprochen und **bewusst verworfen**: es gibt keinen maschinenlesbaren Frist-Zeitpunkt
  (nur der Anzeigetext `backtag_deadline_text`, z. B. „Freitag 18 Uhr"), und der Betreiber
  deaktiviert den Backtag ohnehin manuell im Admin — die dort bereits vorhandene aggregierte
  Backliste (`lib/backstubeOrders.ts`) deckt den Bedarf ab. Alte Warenkorb-Demo
  (`components/cart/*`, `lib/products.ts`) bleibt ungenutzt.
- ✅ **Bestellzeilen-UI überarbeitet (2026-07-06/07, Kundenfeedback nach Live-Test):**
  `components/backstube/BackstubeOrder.tsx` + `.order-item`/`.qty`/`.add-btn`/`.order-bar` in
  `globals.css`. Menge ist jetzt ein editierbares Zahlenfeld (`inputmode="numeric"`, Fokus markiert
  den Inhalt) statt nur ±1-Klicks — direktes Eintippen z. B. „10". Spalten-Layout neu: Titel größer/
  fetter (`font-display`, 700), Beschreibung bricht sauber vor der Preis-Spalte um, Preis in eigener
  fixer Spalte (`5rem`/mobil `4.5rem`, linksbündig), Bestell-Spalte (Button/Stepper) fix breit
  (`12rem` Desktop) und beginnt bei **jeder** Zeile an derselben Linie — auch auf Mobile (eigene
  Media-Query `max-width:640px` mit zweizeiligem Grid: Titel+Text oben, Preis+Aktion darunter auf
  fester Spaltenlinie). Stepper-Buttons und Eingabefeld größer (36px/46px). Schwebende
  Warenkorb-Leiste (`.order-bar`) vergrößert (mehr Padding, größere Schrift/Summe) + Hover-Anheb-
  Effekt, damit der Klick zum Abschluss der Bestellung intuitiver wirkt. „+ Vorbestellen"-Button hat
  jetzt sichtbaren Abstand zwischen Icon und Text. Mobile-Layout mit echter Device-Emulation (Chrome
  DevTools Protocol, 390px) verifiziert — kein horizontaler Overflow.
- ✅ **CSS-Token-Lücke behoben + Preisgröße (2026-07-07, Kundenfeedback):** `--space-5` wurde an
  ~15 Stellen in `globals.css` referenziert (u. a. `.order-item`-Padding), war aber **nie im
  `:root`-Token-Katalog definiert** — eine ungültige `var()`-Referenz macht die ganze
  Shorthand-Deklaration ungültig, das Padding fiel also unbemerkt auf `0` zurück. Das war die
  eigentliche Ursache für den zu engen Zeilenabstand zwischen den Backwaren. Fix: Token als
  `1.25rem` ergänzt (passend zur bestehenden 0,25rem-Schrittfolge zwischen `--space-4` und
  `--space-6`) — behebt alle betroffenen Stellen gleichzeitig, nicht nur die Bestellliste.
  Zusätzlich `.order-item-price` um **50 % vergrößert** (`calc(var(--text-lg) * 1.5)`, Desktop
  + Mobil einheitlich) auf expliziten Kundenwunsch.
- ✅ **Rezepte, Zutaten-Stammdaten & Zutaten-Bedarf (2026-07-07, Kundenwunsch):** Jede Backware
  kann bis zu **10 Zutaten** (Rezept) bekommen. **Verbindliche Architektur — eine Source of Truth:**
  die Backware wird **nur in der Speisekarte** angelegt/bepreist/verfügbar geschaltet
  (`/admin?area=backstube`, `MenuAdmin`); das Rezept hängt direkt im selben `ItemEditor`, **kein
  zweiter Anlege-Ort**. Zutaten sind **zentrale Stammdaten** (`backstube_ingredients`, Name
  **case-insensitive eindeutig** + feste Einheit), die der Betreiber oben im Backstube-Tab pflegt
  (`components/admin/IngredientsAdmin.tsx`, `app/admin/ingredient-actions.ts`) und pro Rezept nur
  noch **auswählt** (Dropdown) — nie Freitext, damit die Aggregation über die Zutat-ID läuft und
  „Wasser" nicht doppelt entsteht. Löschen einer benutzten Zutat wird mit Anzahl geblockt.
  Rezept-Zeilen in `menu_item_ingredients` (`menu_item_id`→`ingredient_id`+`amount`, ≤10 server-
  validiert), persistiert über den bestehenden `updateItem` (`ItemInput.recipe`) inkl. Dirty-Status.
  **Bedarfsrechnung:** `getBackstubeOrders` liefert je Backware die hochgerechneten Zutaten
  (Rezept × Bestellmenge) **und** eine Gesamt-Einkaufsliste (`ingredientTotals`) über alle offenen
  Bestellungen — **live** aus dem aktuellen Rezept (nicht im Bestell-Snapshot eingefroren, da mit
  dem heutigen Rezept gebacken wird). Backwaren ohne hinterlegtes Rezept werden in der Backliste
  sichtbar markiert. **RLS: admin-only** (Lesen *und* Schreiben) — Rezeptmengen sind interne
  Betriebsdaten, anon/Publishable-Key sieht die Tabellen nie. **Datenschicht-Split:** client-sicher
  `lib/ingredients.ts` (Typen/Konstanten/`formatAmount`) vs. Server-Loader `lib/getIngredients.ts`
  (nötig wie `backtag.ts`↔`getBacktag.ts`, sonst zieht der Client-Import den Server-Client mit → Build-
  Bruch). Migration `20260707100000_backstube_recipes_schema.sql` live angewandt, Advisor-Check
  sauber, Join-/Aggregationslogik mit Testdaten durchgerechnet (30 g → 300 g bei 10×), Testdaten
  wieder entfernt. **Offen:** eingeloggte Admin-UI der neuen Panels noch nicht klick-getestet
  (braucht Magic-Link-Login).

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
- **Startseiten-Kachel Biergarten** bleibt bewusst das wiederverwendete Hero-Foto (Entscheidung
  2026-07-06, kein separates Foto vorhanden) — kein offener Foto-Punkt mehr.

### Local-SEO ✅ (gebaut 2026-07-06)
- **JSON-LD** (`lib/structuredData.ts`, in `app/page.tsx`): Typ **`FoodEstablishment`** (bewusst
  ohne „Bakery"), Adresse/Telefon aus `site_settings`, Öffnungszeiten (heute + `upcoming` aus
  `opening_days`) als `openingHoursSpecification` je Datum.
- **`app/sitemap.ts`** (alle öffentlichen Routen) + **`app/robots.ts`** (Disallow `/admin`,
  `/auth`, verweist auf die Sitemap) — Next.js-Metadata-Routes, kein manuelles XML.
- **Offen:** Google-Business-Profil verlinken (NAP-Konsistenz) — mit dem Kunden zu klären
  (Termin heute Abend, 2026-07-06).

### Admin-UX
- ✅ **Erledigt:** Save-Status grün/rot (deckungsgleich mit Live ↔ ungespeichert),
  Löschen mit Anzahl-Rückfrage.
- Hoch/Runter-Sortierpfeile bleiben vorerst (Drag&Drop später, „schauen wie wir es leben").
- Offen: Handy-Tauglichkeit des Admin prüfen (Betreiber pflegt vermutlich vom Smartphone).

### Local-SEO
- Erwünscht, aber **kein `Bakery`-Schema** (Titelschutz) — passenderer `schema.org`-Typ
  (z. B. `Restaurant`/`FoodEstablishment`) mit Adresse/Öffnungszeiten/Geo; `sitemap.xml`,
  `robots.txt`, Google-Business-Profil.
