# Handoff: Kurvenbeck — Startseite & Bereichsseiten

> Entwickler-Briefing für die Umsetzung mit Claude Code.
> Stand: Juni 2026 · Sprache der Website: **Deutsch**

---

## 0. Umsetzungsstand

Die Designs sind als **Next.js-App (App Router, TypeScript)** unter **`web/`**
umgesetzt — Setup & Struktur: `web/README.md`. Projektkonventionen
(durchgängige **Du-Ansprache**, Design-Tokens, Bild-Workflow, Kontaktdaten):
`CLAUDE.md`. Offene Aufgaben: `web/TODO.md`. Die `*.html`-Dateien im Root bleiben
reine Design-Referenz.

**Umgesetzt:**
- Alle vier Seiten (Start, Biergarten, Catering, Backstube) + Platzhalterseiten
  Impressum/Datenschutz/AGB.
- Mobile Off-Canvas-Navigation (Hamburger), Sticky-Header, Footer.
- Catering-Formular mit Client-Validierung + Erfolgszustand (**Demo**, noch ohne Backend).
- Backstube-Warenkorb mit `localStorage`-Persistenz, Drawer, Mengen-Stepper (**Demo**).
- Bild-System: `<Photo>` + Registry (`web/lib/images.ts`), WebP-Upload-Ordner
  `web/public/images/` (Platzhalter bis echte Fotos vorliegen).
- Zentrale Kontaktdaten (`web/lib/siteSettings.ts`) für Telefon/`tel:`/`wa.me`.
- A11y/SEO-Basis: Landmarks, `aria`-Attribute, Fokus-Styles, `prefers-reduced-motion`,
  Metadata/OpenGraph je Seite.

**Bewusste Abweichungen vom Prototyp (Content/Tonalität):**
- Durchgängige **Du-Form** statt Sie.
- Überarbeitete Hero-Texte: Startseite (neuer Eyebrow/Headline/Tagline, CTAs entfernt)
  und Biergarten (neuer Lede + Intro mit „Tisch reservieren"/„WhatsApp"-CTAs).

Detaillierter Status der ursprünglichen offenen Punkte: siehe **§12**.

---

## 1. Überblick

Neue Web-Präsenz für den Familienbetrieb **Kurvenbeck** (gegründet 1978). Drei eigenständige Geschäftsbereiche unter einer Marke, die auf der Startseite klar getrennt werden und jeweils eine eigene Unterseite haben:

| Bereich | Inhalt | Besonderheit |
|---|---|---|
| **Biergarten** | Speisekarte (Speisen + Getränke), Öffnungszeiten, Anfahrt | reine Info-/Menüseite |
| **Catering** | Beispiel-Menüs, Ablauf, Anfrageformular | Lead-Formular |
| **Backstube** | Backwaren-Shop (Brezel, Briegl, Körnerwecken …) | **Warenkorb** (Vorbestellung/Abholung) |

Gewählte visuelle Richtung: **Option C — „Warm & Handwerklich“** (bildgeführter Hero, schwäbische Taglines, warme Karten). Die Alternativen A/B liegen als Referenz bei, sind aber **nicht** Teil des Scopes.

---

## 2. Über die Design-Dateien

Die beigelegten Dateien sind **Design-Referenzen in HTML/CSS/JS** — Prototypen, die Aussehen und Verhalten zeigen, **kein** produktiv zu kopierender Code.

**Aufgabe:** Diese Designs in der Ziel-Umgebung des Projekts nachbauen. Empfohlener Stack laut Design-Guide: **Next.js** (es ist von `apps/web`, `apps/admin` und `next/image` die Rede) — falls bereits ein Repo existiert, dessen Patterns/Komponenten nutzen. Falls noch keine Umgebung existiert, Next.js (App Router) + CSS-Variablen/Tailwind wählen.

Die HTML-Prototypen **nicht** direkt ausliefern.

---

## 3. Fidelity

**High-Fidelity.** Finale Farben, Typografie, Abstände und Interaktionen sind verbindlich und sollen pixelgenau mit den Komponenten/Patterns des Ziel-Codebases umgesetzt werden. Maßeinheiten und Tokens unten sind exakt einzuhalten.

---

## 4. Design-Tokens

Quelle: `kurvenbeck-design-guide.md` (Single Source of Truth). Vollständige CSS-Variablen liegen in `assets/tokens.css` bei.

### Farben
| Token | Wert | Verwendung |
|---|---|---|
| `--color-primary` | `#565655` | Headlines, sekundäre Buttons, Struktur |
| `--color-accent` | `#ab0d0e` | Primäre CTAs, Hover, aktive States, Akzentlinien |
| `--color-background` | `#ffffff` | Seitenhintergrund |
| `--color-surface` | `#f7f4f0` | Cards, Section-Flächen (warmes Creme) |
| `--color-dark-bg` | `#565655` | Hero/Statement-Bereiche (Text immer **#ffffff**) |
| `--color-text-primary` | `#565655` | Fließtext, Headlines |
| `--color-text-secondary` | `#7a7a79` | Subtitles, sekundärer Body |
| `--color-text-muted` | `#a0a09f` | Labels, Legal, Captions |
| `--color-border` | `rgba(86,86,85,0.15)` | Trennlinien, Card-Border |

> **Kontrast-Regel:** Weiß auf `#565655` ≈ 4.5:1. Body-Text in dunklen Sections **immer `#ffffff`**, nie halbtransparent.

### Typografie
- **Display/Headlines:** `Playfair Display` (700 / 800), Fallback `Georgia, serif`
- **Body:** `DM Sans` (300 / 400 / 500), Fallback `system-ui, sans-serif`
- Schwäbische Taglines: `Playfair Display` **kursiv 700** (kein separater Script-Font)
- Google-Fonts-Import: `Playfair+Display:ital,wght@0,700;0,800;1,700` + `DM+Sans:wght@300;400;500`

**Type Scale** (rem): xs .75 · sm .875 · base 1 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25 · 5xl 3 · 6xl 3.75
**Line-height:** tight 1.1 · snug 1.3 · normal 1.5 · relaxed 1.7
**Letter-spacing:** tight -.03em (Display) · normal 0 · wide .08em (Caps-Labels/Nav)

### Spacing (8px-Grid, rem)
1 .25 · 2 .5 · 3 .75 · 4 1 · 6 1.5 · 8 2 · 10 2.5 · 12 3 · 16 4 · 20 5 · 24 6

### Radius / Transitions
- Radius: sm .25rem (Chips) · md .5rem (Buttons/Cards = Standard) · lg .75rem (Panels) · xl 1rem (spezielle Elemente)
- Transitions: fast .2s ease (Hover) · normal .3s ease (Menüs/Panels) · slow .5s ease (Page)

### Container & Breakpoints
- `.container`: `max-width: 1280px`, zentriert, padding-inline Desktop 80px / Tablet 48px / Mobile 16px
- Breakpoints: Mobile < 640 · Tablet 768 · Tablet-LS 1024 · Desktop 1280

### Section-Padding
- Desktop: 80px (Standard) / 96px (große Heros) oben+unten
- Mobile/Tablet ≤ 640: 64px

---

## 5. Globale Komponenten

### Header (`.site-header`)
- Sticky, `top:0`, z-index 50, Höhe **72px**, Hintergrund `rgba(255,255,255,0.88)` + `backdrop-filter: blur(10px)`, untere Border `--color-border`.
- Links: Wortmarke-Logo. Mitte: Nav (Biergarten / Catering / Backstube). Rechts: CTA-Button.
- Nav-Links: `DM Sans` 500, `--text-sm`, Farbe `--color-text-secondary`; **Hover → `--color-accent`**. Aktiver Link: `--color-primary` mit 2px Unterstrich in `--color-accent`.
- **Variante `on-dark`** (nur Option B): transparent über dunklem Hero, Logo/Links in Weiß.
- **Mobile (≤ 860px):** Nav ausgeblendet → **Hamburger-Menü ist noch zu bauen** (offener Punkt).

### Logo-Wortmarke (`.kb-logo`)
Aktuell als Schriftzug umgesetzt, da echtes Asset laut Guide aussteht: „Kurven“ in `--color-primary` + „beck“ in `--color-accent`, `Playfair Display` 800, optionales `<small>`-Suffix (z. B. „seit 1978“) in `DM Sans`, Caps, `--color-text-muted`. **Sobald Logo-WebP/SVG vorliegt: ersetzen.**

### Buttons (`.btn`)
Padding `12px 24px`, Radius `md`, `DM Sans` 500, `--text-sm`. **Hover = nur Schatten, kein Farbwechsel.**
- `.btn-primary`: BG `#ab0d0e`, Text weiß · Hover-Shadow `0 6px 16px rgba(171,13,14,.35)`
- `.btn-secondary`: BG `#565655`, Text weiß · Hover-Shadow `0 6px 16px rgba(86,86,85,.35)`
- `.btn-ghost`: BG weiß, Border `rgba(86,86,85,.25)` · Hover-Shadow `0 6px 16px rgba(86,86,85,.20)`
- `.btn-ghost--inverted`: transparent, Border `rgba(255,255,255,.4)`, Text weiß (auf dunklem BG)

### Footer (`.site-footer`)
BG `--color-surface`, obere Border. 4-Spalten-Grid: Brand+Claim · Bereiche · Kontakt · Öffnungszeiten. Spalten-Überschriften: `DM Sans` 500, Caps, `--text-xs`, `--color-text-muted`. Darunter Legal-Zeile (© + Impressum/Datenschutz/AGB). Responsive: 2 Spalten ≤ 860, 1 Spalte ≤ 480.

### Bild-Platzhalter (`.ph`)
Alle Bilder sind aktuell beschriftete Platzhalter (diagonal gestreift, `data-label` mit Foto-Beschreibung + Seitenverhältnis). **Beim Umbau durch echte Bildkomponente ersetzen** (`next/image`, Hero mit `priority`). Bildstil laut Guide: warm, authentisch, `filter: saturate(1.1) brightness(0.95)`.

---

## 6. Screens / Views

### 6.1 Startseite — `index.html` (Option C „Warm & Handwerklich“)
**Zweck:** Einstieg, Marke vermitteln, in die drei Bereiche leiten.

1. **Hero** (`data-screen-label="Home C · Hero"`): vollbreites Stimmungsbild, Höhe `88vh` (min 600 / **max 820px**), dunkler Verlaufs-Scrim (`linear-gradient` von 0.85 unten zu 0.25 Mitte). Inhalt unten links: Eyebrow „Familienbetrieb seit 1978“, H1 „Drei Handwerke, ein Name.“ (`clamp(2.75rem,6.5vw,5rem)`, weiß), Tagline kursiv „Bei uns kommt's frisch auf den Tisch.“, zwei CTAs (`btn-primary` „Biergarten entdecken“ → biergarten.html, `btn-ghost--inverted` „Online vorbestellen“ → backstube.html).
2. **Intro** (zentriert, max 60ch): Eyebrow, H2 „Bewirten, beliefern, backen“, Fließtext.
3. **Drei Karten** (`.hcard`, gestapelt, gap 48px): jede Karte = großes Foto + Textseite, **abwechselnde Spaltenverteilung** (`nth-child(even)` spiegelt: Foto rechts), BG `--color-surface`, Border, Radius `xl`, Shadow `0 10px 30px rgba(86,86,85,.07)`. **Hover:** `translateY(-3px)` + Shadow `0 18px 44px rgba(86,86,85,.13)`, „Mehr“-Link → `--color-accent`. Inhalt je Karte: runde rote Nummer (40px), Bereichs-Label (Caps), H3-Tagline, Fließtext, Link. Ganze Karte ist `<a>` zur Unterseite.
   - 1 Biergarten — „Hock di na.“ → biergarten.html
   - 2 Catering — „Ihr Fest, unser Handwerk.“ → catering.html
   - 3 Backstube — „Schnell sei, sonst isch's weg.“ → backstube.html
4. **Schluss-Band** (`.closing`): dunkel `--color-dark-bg`, zentriert, H2 „Ein Anruf, ein ganzes Fest“, Fließtext, zwei CTAs.
5. **Footer.**

**Responsive ≤ 860:** Karten einspaltig, Foto immer oben.

### 6.2 Biergarten — `biergarten.html`
**Zweck:** Speisekarte ansehen, Öffnungszeiten/Anfahrt.
- **Page-Hero** (dunkel, `.page-hero`): Eyebrow „Biergarten“, H1 „Hock di na.“ (`--text-6xl`), Lede.
- **Intro** zweispaltig: Text + Foto (4:5).
- **Speisekarte** (`#speisekarte`, BG `--color-surface`): zwei Blöcke „Vesper & Warmes“ und „Getränke“. Jeder Block: H3 mit 2px rotem Unterstrich, darunter Positionsliste. Position = Name (500) + optional Beschreibung (sm, secondary) links, **Preis rechts** (`Playfair Display` 700). Gepunktete Trennlinien. Tags („vegetarisch“, „alkoholfrei“) als kleine rote Outline-Chips.
- **Info-Cards** (3-spaltig): Öffnungszeiten (groß „11 – 23 Uhr“), Finden & Parken, Größere Runden (Link zu Catering).
- **Footer.**

### 6.3 Catering — `catering.html`
**Zweck:** Leistungen zeigen, Anfrage generieren.
- **Page-Hero:** „Ihr Fest, unser Handwerk.“
- **Beispiel-Menüs** (`.cat-grid`, 3-spaltig → 2 → 1): Cards mit Foto (3:2), H3, Beschreibung, Meta (Preis/Mindestgäste), „Menü ansehen →“. **Hover:** Card-Shadow `0 8px 24px rgba(86,86,85,.10)` + Link → accent. 6 Beispiele (Fingerfood, Schwäbisches Buffet, BBQ, Hochzeit, Frühstück/Brunch, Suppenküche).
- **Ablauf** (`.process`, BG `--color-surface`, 4 Schritte): große rote `Playfair`-Nummer 01–04, H4, Text.
- **Anfrageformular** (`#anfrage`, zweispaltig): links Text + Vorteils-Liste (rote Dots); rechts `.form-card` (weiß, Radius lg, Padding 40px). Felder: Name, E-Mail, Anlass (Select), Gäste (Number), Wunschdatum (Date), Nachricht (Textarea). Focus: `outline 2px rgba(171,13,14,.3)` + Border accent. **Demo — `onsubmit="return false"`, keine echte Übermittlung (offener Punkt: Backend/E-Mail anbinden).**
- **Footer.**

### 6.4 Backstube — `backstube.html` (mit Warenkorb)
**Zweck:** Backwaren ansehen und für Abholung vorbestellen.
- **Header:** statt CTA ein **Warenkorb-Button** (`.cart-btn`, grau) mit roter **Count-Badge** (`#cartCount`).
- **Page-Hero:** „Schnell sei, sonst isch's weg.“
- **Info-Banner** (BG surface): Hinweis Vorbestellung bis 18 Uhr / Abholung ab 6 Uhr.
- **Produktraster** (`#shop`, 3-spaltig → 2 → 1): wird per JS aus `products[]` gerendert. Card: Foto (4:3), optional rotes Badge, H3, Beschreibung, Footer mit Preis (`Playfair` 700, `--text-2xl`) + **„+ In den Korb“** (`.add-btn`, rot; `:active` scale .95). 6 Produkte: Original Brezel 1,20 · Briegl 0,95 · Körnerwecken 1,10 · Laugenstange 1,40 · Bauernbrot 4,80 · Sonntagszopf 3,60 (€, pro Stück).
- **Warenkorb-Drawer** (`.drawer`): rechts einfahrend (`translateX`), 380px / max 90vw, Scrim dahinter. Kopf „Ihr Warenkorb“ + Close (×). Body: Zeilen mit Name, Zeilensumme (`Playfair` 700), **Mengen-Stepper** (–/+). Fuß: Summe (`Playfair` 800, `--text-3xl`) + Button „Zur Abholung bestellen“. **Demo — keine echte Bestellung.** Leerzustand-Text vorhanden. `Esc` schließt.
- **Footer.**

---

## 7. Interaktionen & Verhalten

- **Navigation:** Logo → `index.html`. Nav + alle CTAs/Cards verlinken auf die jeweilige Unterseite (siehe oben). Innerhalb Biergarten: Anker `#speisekarte`.
- **Hover-System (global):** Cards heben per Shadow; Icon-/Link-Text wechselt auf `--color-accent`; Buttons nur Schatten. Transition `.2s ease`.
- **Scroll-Reveal** (Option A nutzt es; für C optional): `.scroll-reveal` startet `opacity:0; translateY(20px)`, wird via `IntersectionObserver` (threshold .12) auf `.is-visible` gesetzt → `opacity:1; translateY(0)`, Transition `.5s ease`. Feature-Flag-Klasse `enable-scroll-animations` am `<body>`. Selektiv einsetzen, Mobile-Performance beachten. `prefers-reduced-motion` respektieren (Endzustand ohne Animation zeigen).
- **Backstube-Drawer:** öffnet automatisch beim Hinzufügen; schließt per ×, Scrim-Klick oder `Esc`. Transition `.3s ease`.

---

## 8. State Management

Nur **Backstube** ist zustandsbehaftet (Prototyp: simples JS-Objekt — im Ziel-Stack als Store/Context oder lokaler Komponenten-State):

- `cart: { [productId]: qty }`
- Aktionen: `addToCart(id)` (+1, Drawer öffnen), `changeQty(id, ±1)` (bei 0 entfernen)
- Abgeleitet: Gesamtanzahl → Badge; Summe = Σ(preis × menge), Format `de-DE` mit `€`
- **Persistenz empfohlen** (localStorage o. ä.), damit der Korb einen Reload übersteht.
- **Produktdaten** später aus CMS/Backend statt hartem `products[]`-Array.

---

## 9. Responsive-Verhalten

- Header-Nav verschwindet ≤ 860px → **Hamburger nachrüsten** (Off-Canvas/Sheet).
- Startseite-Karten, Catering-Grid, Backstube-Grid und Footer kollabieren wie in §6 beschrieben.
- Heros nutzen `clamp()` für Schriftgrößen; Container-Padding skaliert mit Breakpoints.
- Mobile-Mindestmaße: Touch-Ziele ≥ 44px, Body-Text in dunklen Sections immer voll weiß.

---

## 10. Assets

- **Logo:** echtes WebP/SVG **ausstehend** — aktuell Schriftzug-Fallback (`.kb-logo`). Bei Lieferung global ersetzen.
- **Fotos:** alle als beschriftete Platzhalter (`.ph` mit `data-label`). Benötigt u. a.: Startseite-Hero (1920×1080, Biergarten-Stimmung), je Bereich ein Foto, Catering-Beispiele (6×, 3:2), Backwaren (6×, 4:3), Biergarten-Intro (4:5). Stil: warm/authentisch, `next/image` + Hero `priority`.
- **Icons:** minimal (Pfeile/×/Schloss als Text-Glyphen). Bei Bedarf konsistentes Icon-Set ergänzen.
- **Keine** Marken-/Drittanbieter-Assets im Prototyp.

---

## 11. Dateien im Bundle

| Datei | Inhalt |
|---|---|
| `index.html` | **Finale Startseite** (Option C) |
| `biergarten.html` | Unterseite Biergarten + Speisekarte |
| `catering.html` | Unterseite Catering + Anfrageformular |
| `backstube.html` | Unterseite Backstube + Warenkorb |
| `assets/tokens.css` | Alle Design-Tokens, Buttons, Logo, Platzhalter, Helpers |
| `assets/site.css` | Header, Page-Hero, Sections, Footer (gemeinsames Chrome) |
| `kurvenbeck-design-guide.md` | Original-Design-Guide (Referenz) |
| `home-klassisch.html`, `home-split.html` | Verworfene Optionen A/B — nur Referenz, **out of scope** |

---

## 12. Offene Punkte / To-do für die Umsetzung

> Status: ✅ erledigt · 🟡 teilweise / Demo · 🔲 offen.
> Verbleibende Aufgaben mit Schritten: `web/TODO.md`.

1. ✅ **Mobile-Navigation** (Hamburger/Off-Canvas) — in `SiteHeader` umgesetzt (Esc/Scrim schließt).
2. 🟡 **Catering-Formular** — Client-Validierung + Erfolgszustand vorhanden; **Backend/E-Mail noch anzubinden** (Demo).
3. 🟡 **Backstube-Warenkorb** — Drawer, Stepper, `localStorage`-Persistenz vorhanden; **Abhol-Slot & Checkout-Flow offen** (Demo).
4. 🔲 **Echte Fotos + Logo** — Infrastruktur steht (`<Photo>` + Registry + Upload-Ordner); Dateien einsetzen & Slots freischalten. Logo-Fallback ersetzen.
5. 🟡 **Standardseiten** — Impressum/Datenschutz/AGB als Platzhalter angelegt; Kontakt/Anfahrt (Karte) und echte Rechtstexte offen.
6. 🔲 **Produktdaten/Speisekarte** — aktuell statisch (`web/lib/products.ts`, Menü in `biergarten`); aus CMS/Backend laden.
7. 🟡 **A11y/SEO** — Landmarks, Fokus-Styles, Metadata/OG umgesetzt; Alt-Texte folgen mit echten Fotos.
8. 🔲 **Inhalte** (Adresse, Telefon, Preise, Öffnungszeiten) sind **Platzhalter** — final einpflegen. Telefonnummer künftig aus Supabase `site_settings` (`web/lib/siteSettings.ts`).
