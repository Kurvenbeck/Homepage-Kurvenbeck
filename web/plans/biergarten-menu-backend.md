# Plan: Biergarten-Menü-Backend (Supabase + eigene Admin-Seite)

> Verbindliche Spezifikation: `memory/biergarten-menu-backend.md` + `memory/menu-no-images.md`
> (per Grill-me am 2026-07-03 festgezurrt). Bei Konflikt gilt das Gedächtnis, dann dieser Plan.
> Deckt zugleich `web/TODO.md` #1 (Supabase-Anbindung) ab.

**Ziel:** Der nicht-technische Kunde pflegt die Biergarten-Speise-/Getränkekarte inkl.
Allergene selbst. Live-Seite bleibt nach dem Umbau **optisch identisch** (Seed aus heutiger
Karte). Generisch (`area`-Spalte), damit Backstube später andockt. **Keine Produktfotos.**

**App:** `web/` — Next.js 15.1.6 (App Router), React 19, TypeScript, Port **3003**.
**Supabase-Projekt:** `https://dbzxowlgmwnytanfnzdb.supabase.co` (Ref `dbzxowlgmwnytanfnzdb`).

---

## Geklärt (2026-07-03)

Tag-Satz = **vegetarisch / vegan / alkoholfrei** (Nutzerentscheid). Die heutige
`alkoholfrei`-Pill an der Hausgemachten Limonade bleibt damit 1:1 als Tag erhalten.

---

## Phase 0 — Dokumentations-Discovery (erledigt, Referenz für alle Phasen)

**Bestätigte Fakten (Quellen: supabase.com/docs, 2026-07-03):**

- **Packages:** `npm install @supabase/supabase-js @supabase/ssr` (Versionen pinnen, Lockfile committen).
- **Keys:** Docs nutzen inzwischen `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`).
  Der klassische `anon`-Key funktioniert weiter. → In `.env.local`:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (bzw. `…ANON_KEY`).
  **Kein `service_role`/Secret-Key in der App.**
- **Browser-Client:** `createBrowserClient(url, key)` aus `@supabase/ssr`.
- **Server-Client:** `createServerClient(url, key, { cookies: { getAll, setAll } })` mit
  **async `cookies()`** (Next.js 15). `setAll` in try/catch (Server Components dürfen keine
  Cookies schreiben → in Middleware refreshen).
- **Middleware:** `updateSession(request)` refresht Token, nutzt `getClaims()`/`getUser()`,
  schützt Routen per Redirect. Root-`middleware.ts` mit `config.matcher`.
- **Magic-Link:** `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false,
  emailRedirectTo } })` → verhindert Neu-Anlage. Confirm-Route via `verifyOtp({ token_hash, type })`.
- **Signups deaktivieren:** Dashboard → Auth → Providers → Email (projektweit).

**Doc-URLs zum Kopieren des Volltext-Codes (im jeweiligen Schritt frisch öffnen, nicht erfinden):**
- Server/Browser/Middleware-Clients: `https://supabase.com/docs/guides/auth/server-side/creating-a-client.md`
- Next.js-Gesamtguide: `https://supabase.com/docs/guides/auth/server-side/nextjs.md`
- Magic-Link + Confirm-Route: `https://supabase.com/docs/guides/auth/auth-email-passwordless.md`
- RLS-Policies: `https://supabase.com/docs/guides/database/postgres/row-level-security.md`
- Vor Schema-Commit: `supabase db advisors` (bzw. MCP `get_advisors`) laufen lassen.

**Anti-Patterns (aus supabase-Skill Security-Checkliste):**
- Kein `service_role` im Client/`NEXT_PUBLIC_`.
- `user_metadata`/`auth.jwt()`-Metadaten **nie** für Autorisierung → Admin-Check gegen `admins`-Tabelle.
- RLS auf **jeder** Tabelle im `public`-Schema aktivieren.
- UPDATE-Policy braucht `USING` **und** `WITH CHECK`; UPDATE braucht zusätzlich eine SELECT-Policy.
- `auth.role()` ist deprecated → `TO authenticated` + Prädikat verwenden.
- Views (falls genutzt): `WITH (security_invoker = true)`.

---

## Phase 1 — Supabase-Fundament: Clients, Env, Middleware-Gerüst

**Umsetzen:**
1. Packages installieren (s. o.), Versionen pinnen.
2. `web/.env.local` anlegen (in `.gitignore` prüfen!) mit URL + publishable/anon key.
   Nutzer muss den Key aus Dashboard → Project Settings → API holen.
3. Clients **kopieren** aus `creating-a-client.md` (Next.js-Tab):
   - `web/utils/supabase/client.ts` (Browser)
   - `web/utils/supabase/server.ts` (Server, async cookies)
   - `web/utils/supabase/middleware.ts` (`updateSession`)
   - `web/middleware.ts` (root, `config.matcher` — vorerst nur Session-Refresh, noch kein Route-Schutz).
4. Rauch-Test: eine Server-Component liest `createClient()` ohne Fehler.

**Verifikation:** `npm run build` grün · `grep -r "service_role" web/` liefert **nichts** ·
`grep -rn "NEXT_PUBLIC_SUPABASE" web/utils` zeigt beide Clients.

**Anti-Pattern-Guard:** Keinen Secret-Key committen; `.env.local` nicht ins Repo.

---

## Phase 2 — Schema + RLS + Seed (SQL-Migrationen)

**Umsetzen** (via MCP `execute_sql` iterieren, dann als Migration committen — s. supabase-Skill
„Making and Committing Schema Changes"; Dateien landen in `web/supabase/migrations/`):

Tabellen (alle im `public`-Schema, **RLS an**):
```
admins(email text primary key)
menu_categories(id uuid pk default gen_random_uuid(), area text not null,
                title text not null, sort_order int not null default 0,
                created_at timestamptz default now())
menu_items(id uuid pk default gen_random_uuid(),
           category_id uuid references menu_categories(id) on delete cascade,
           name text not null, description text, price numeric(6,2) not null,
           is_available boolean not null default true, sort_order int not null default 0,
           tags text[] not null default '{}',   -- 'vegetarisch' | 'vegan' | 'alkoholfrei'
           created_at timestamptz default now())
allergens(code text primary key, label text not null, sort_order int not null)
menu_item_allergens(menu_item_id uuid references menu_items(id) on delete cascade,
                    allergen_code text references allergens(code),
                    primary key(menu_item_id, allergen_code))
```
_Hinweis:_ Tags als `text[]` (nur 2 Werte, kein Join nötig). Allergene als Join (14 Stammdaten).

**RLS-Policies:**
- Public read (`TO anon, authenticated ... USING (true)`) auf `menu_categories`,
  `menu_items`, `allergens`, `menu_item_allergens`.
- `admins`: **keine** anon-Policy (nicht öffentlich lesbar).
- Write (INSERT/UPDATE/DELETE) auf die vier Menü-Tabellen nur
  `TO authenticated USING (exists (select 1 from admins where email = auth.email()))`,
  UPDATE zusätzlich `WITH CHECK (…)`. Helper: `create function is_admin() returns boolean
  language sql security invoker stable as $$ select exists(select 1 from admins where email = auth.email()) $$;`
  (in `public`, aber nur `auth.email()`-basiert; alternativ inline in Policy).
- Data-API-Zugriff der Rollen prüfen (`GRANT` falls Tabellen nicht exponiert).

**Seed:**
- `admins`: `kontakt@kurvenbeck.com`, `ihringmichael@gmail.com`.
- `allergens`: 14 EU-Codes (A Glutenhaltiges Getreide, B Krebstiere, C Eier, D Fisch,
  E Erdnüsse, F Soja, G Milch/Laktose, H Schalenfrüchte, L Sellerie, M Senf, N Sesam,
  O Sulfite, P Lupinen, R Weichtiere).
- Biergarten-Karte aus `web/app/biergarten/page.tsx` **1:1** (Kategorien „Vesper & Warmes",
  „Getränke"; alle Items mit Name/Beschreibung/Preis/Reihenfolge; Käsespätzle-Tag
  `vegetarisch`; Limonade-Tag `alkoholfrei`). Allergene sind heute nicht gepflegt →
  vorerst leer lassen (Kunde ergänzt später).

**Verifikation:** `supabase db advisors` ohne kritische Findings · Test-`select` liefert beide
Kategorien + alle Items · anonymer Client kann `admins` **nicht** lesen · `supabase migration list --local`
zeigt die Migration.

**Anti-Pattern-Guard:** RLS auf allen Tabellen an; keine `SECURITY DEFINER`-Umgehung; kein `photo`-Feld.

---

## Phase 3 — Biergarten-Seite liest aus DB (read-only, optisch identisch)

**Umsetzen:**
1. `web/lib/menu.ts`: `getMenu(area)` — lädt Kategorien (sort_order) + Items (`is_available=true`,
   sort_order) + verknüpfte Allergen-Codes, serverseitig via `utils/supabase/server.ts`.
   Preis-Formatter `formatPrice(numeric) → "12,90"`.
2. `web/app/biergarten/page.tsx`: den hartkodierten `menu-wrap`-Abschnitt durch DB-Render
   ersetzen. **Exakt gleiche Klassen** (`.menu-grid/.menu-block/.menu-item/.mi-name/.mi-desc/
   .mi-price/.menu-tag`) — Markup-Struktur aus dem heutigen JSX übernehmen.
3. Allergen-Anzeige: Codes hinter dem Namen (z. B. `(A, G)`); **Legende nur der auf der Seite
   tatsächlich verwendeten** Allergene unter der Karte (neues, dezentes Element + Token-Styles).
   Da Seed keine Allergene hat, ist die Legende zunächst leer/ausgeblendet → Optik unverändert.
4. Seite bleibt dynamisch (SSR) — `export const dynamic = "force-dynamic"` o. ä., damit
   Änderungen sofort sichtbar sind (Runde 1a).

**Verifikation:** `npm run build` grün · visueller Vergleich localhost:3003/biergarten gegen
vor-Umbau-Screenshot → **identisch** · Ändere testweise einen Preis in der DB → nach Reload sichtbar.

**Anti-Pattern-Guard:** Keine neuen „magischen" Werte — Styles über bestehende Tokens/Klassen.
Marketing-Headlines („Drauß' schmeckt's am besten" etc.) bleiben **hartkodiert**.

---

## Phase 4 — Auth: Magic-Link-Login + Route-Schutz

**Umsetzen:**
1. Login-Seite `web/app/admin/login/page.tsx` (Client): E-Mail-Feld →
   `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo:
   <origin>/auth/confirm } })`. Du-Form, deutsche Texte, Erfolg/Fehlerzustand.
2. Confirm-Route `web/app/auth/confirm/route.ts`: `verifyOtp({ token_hash, type: 'email' })`
   → Redirect nach `/admin`. Muster aus `auth-email-passwordless.md`.
3. Route-Schutz in `web/utils/supabase/middleware.ts` erweitern: nicht eingeloggt **und** Pfad
   startet mit `/admin` (außer `/admin/login`) → Redirect `/admin/login`. `matcher` in
   `middleware.ts` entsprechend.
4. Dashboard-seitig zusätzlich prüfen, dass `auth.email()` in `admins` steht (Server-Check),
   sonst Abmeldung/Hinweis (Defense-in-depth; RLS schützt Schreiben ohnehin).
5. Supabase-Dashboard: öffentliche Registrierung deaktivieren (Auth → Providers → Email);
   `emailRedirectTo`-Origin in Auth → URL Configuration → Redirect URLs eintragen
   (localhost:3003 + spätere Prod-Domain).

**Verifikation:** Aufruf `/admin` ohne Login → Redirect Login · Magic-Link an
`ihringmichael@gmail.com` kommt an, führt eingeloggt zu `/admin` · fremde E-Mail bekommt
(dank `shouldCreateUser:false`) keinen Zugang · `npm run build` grün.

**Anti-Pattern-Guard:** Autorisierung nur über `admins`-Tabelle, nie über `user_metadata`.

---

## Phase 5 — Admin-Oberfläche (eine Seite pro Bereich)

**Umsetzen:**
1. `web/app/admin/page.tsx` (Server-Component lädt Daten) mit Bereichs-Umschalter (vorerst nur
   „Biergarten" aktiv; „Backstube"/„Catering" sichtbar aber leer/deaktiviert).
2. Client-Komponente(n) `web/components/admin/…`:
   - Kategorien untereinander; je Kategorie ihre Gerichte.
   - Pro Gericht Aufklapp-Zeile: Name, Beschreibung, Preis (Eingabe `12,90`/`12.90` →
     Normalisierung auf `numeric`), Allergen-Checkboxen (**Klartext** neben Code, z. B.
     „☑ G – Milch/Laktose"), Tag-Checkboxen (vegetarisch/vegan), „Verfügbar"-Schalter, Speichern.
   - „+ Gericht", „+ Kategorie", Kategorie umbenennen/löschen.
   - Sortierung per **Hoch/Runter-Pfeilen** (tauscht `sort_order`).
   - Löschen **mit Rückfrage**.
3. Schreibvorgänge als **Server Actions** (`"use server"`) mit eingeloggter Sitzung
   (`utils/supabase/server.ts`) → RLS erzwingt Admin. Nach Mutation `revalidatePath('/biergarten')`
   und `/admin`.
4. Deutsche Du-Form durchgängig; Erfolg/Fehler-Feedback.

**Verifikation:** Als Admin ein Gericht anlegen/bearbeiten/verschieben/löschen → auf
`/biergarten` sichtbar · „Verfügbar" aus → Gericht verschwindet öffentlich, bleibt im Admin ·
Allergen anklicken → Code erscheint am Gericht + in Legende · nicht-Admin-Session kann per
Server Action **nichts** schreiben (RLS) · `npm run build` grün.

**Anti-Pattern-Guard:** Keine Writes über Browser-Client mit anon-Key; alle Mutationen server-seitig.

---

## Phase 6 — Abschluss-Verifikation & Doku

1. Vollständiger Durchlauf: Login → Gericht mit Allergenen anlegen → auf Live-Seite prüfen.
2. Security: `supabase db advisors` clean · `grep -r "service_role" web/` leer · `admins`
   anonym nicht lesbar · RLS auf allen Tabellen.
3. `npm run build` grün (Typecheck + Lint).
4. Doku pflegen: `web/TODO.md` (#1 erledigt, #5-Öffnungszeiten/Backstube-Verweis), `HANDOFF.md`
   (neuer Stand: Menü aus DB, Admin unter `/admin`), ggf. `README` der Env-Variablen.
5. Optionales Folge-TODO notieren: eigener SMTP-Absender über `kurvenbeck.com`, falls
   Supabase-Standard-Mailversand (niedriges Limit) stört.

**Nicht in diesem Plan (Folgeschritte):** Backstube-Andockung (`area='backstube'`, Fotos raus,
gleiche Admin), Catering, Drag&Drop-Sortierung, SMTP.
