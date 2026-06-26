# Kurvenbeck Design Guide — Token-Referenz
> Kompakte Arbeitsreferenz für Komponenten-Entwicklung. Single Source of Truth für alle Design-Tokens.
> Basiert auf den exakten Logo-Farben (gemessen Juni 2026). Gilt für `apps/web` und `apps/admin`.

---

## Farben

### Logo-Ursprungswerte (gemessen)
| Element | HEX | RGB |
|---|---|---|
| Grau (Ring + Schriftzug) | `#565655` | RGB(86, 86, 85) |
| Rot (Kurvenbeck-Script) | `#ab0d0e` | RGB(171, 13, 14) |
| Hintergrund | `#ffffff` | RGB(255, 255, 255) |

### Token-Tabelle (Light Mode)

| Token | Wert | Verwendung |
|---|---|---|
| `--color-primary` | `#565655` | Headlines, Buttons sekundär, Strukturelemente |
| `--color-accent` | `#ab0d0e` | Primäre CTAs, Hover-Icons, Hover-Text, aktive States, Akzentlinien |
| `--color-background` | `#ffffff` | Seitenhintergrund |
| `--color-surface` | `#f7f4f0` | Card-Hintergründe, Section-Hintergründe (warmes Creme) |
| `--color-text-primary` | `#565655` | Fließtext, Headlines |
| `--color-text-secondary` | `#7a7a79` | Subtitles, Body-Text sekundär |
| `--color-text-muted` | `#a0a09f` | Labels, Legal-Text, Captions |
| `--color-border` | `rgba(86,86,85,0.15)` | Trennlinien, Card-Border |
| `--color-shadow` | `rgba(86,86,85,0.12)` | Box-Shadows (warmer Grauton statt Schwarz) |

### Dunkle Sections (Hero, Statement-Bereiche)

| Token | Wert | Hinweis |
|---|---|---|
| `--color-dark-bg` | `#565655` | Hero-Sections, Statement-Bereiche |
| Text auf dunklem BG | `#ffffff` | **Immer volles Weiß** — keine halbtransparenten Weißtöne für Fließtext |
| Sekundäre Labels auf dunkel | `rgba(255,255,255,0.5)` | Nur für UI-Hierarchie (z.B. Standort-Sub-Labels) |
| Trennlinien auf dunkel | `rgba(255,255,255,0.1)` | |
| Inaktive States auf dunkel | `rgba(255,255,255,0.6)` | Nur für funktionale Zustandsunterscheidung |

> **Kontrast-Hinweis:** `#ffffff` auf `#565655` ergibt ~4.5:1 (WCAG AA). Body-Text in Hero-Sections **immer `#ffffff`**, nie abgedunkelt oder halbtransparent.

---

## Logo

- Format: **WebP oder SVG** — wird direkt eingebettet, kein Font-Workaround
- Kein Placeholder-Text als Logo — immer das echte Logo-Asset verwenden
- Bereitstellung durch den Betreiber (noch ausstehend)

---

## Typografie

### Font-Stack

| Rolle | Font | Bezug |
|---|---|---|
| Headlines (alle Sections) | `Playfair Display` | Google Fonts — serif, warm, handwerklich |
| Body-Text | `DM Sans` | Google Fonts — sauber, gut lesbar auf Mobile |
| Swabian Taglines / Marketing-Akzente | Logo-SVG eingebettet | Kein separater Script-Font nötig |

```html
<!-- Google Fonts Import -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```

### Weights

| Rolle | Font | Weight |
|---|---|---|
| Große Überschriften (Hero, Statement) | `Playfair Display` | 800 |
| Section-Überschriften | `Playfair Display` | 700 |
| Sub-Headlines, Labels | `DM Sans` | 500 |
| Body Text | `DM Sans` | 400 |
| Captions, Legal | `DM Sans` | 300 |

### Type Scale

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
```

### Line-Height & Letter-Spacing

```css
--leading-tight:   1.1;      /* Headlines */
--leading-snug:    1.3;      /* Sub-Headlines */
--leading-normal:  1.5;      /* Body */
--leading-relaxed: 1.7;      /* Long-form */

--tracking-tight:  -0.03em;  /* Display Headlines */
--tracking-normal:  0em;     /* Body */
--tracking-wide:    0.08em;  /* Caps Labels, Nav */
```

---

## Spacing (8px Grid)

```css
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Border Radius & Transitions

```css
--radius-sm: 0.25rem;  /* Tags, Chips */
--radius-md: 0.5rem;   /* Buttons, Cards — STANDARD */
--radius-lg: 0.75rem;  /* Panels */
--radius-xl: 1rem;     /* Spezielle Elemente */

--transition-fast:   0.2s ease;  /* Hover, Buttons */
--transition-normal: 0.3s ease;  /* Menüs, Panels */
--transition-slow:   0.5s ease;  /* Page-Transitions */
```

---

## Container & Breakpoints

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: var(--space-20); /* Desktop */
}
/* Tablet: --space-12 | Mobile: --space-4 */
```

| Breakpoint | Wert |
|---|---|
| Mobile | `< 640px` |
| Tablet Portrait | `768px` |
| Tablet Landscape | `1024px` |
| Desktop | `1280px` |

---

## Buttons

```css
/* Primär — ROT — Hauptaktion (Jetzt bestellen, Anfrage senden) */
.btn-primary {
  background: var(--color-accent);       /* #ab0d0e */
  color: #ffffff;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: var(--text-sm);
  border: none;
}
.btn-primary:hover { box-shadow: 0 6px 16px rgba(171,13,14,0.35); }

/* Sekundär — GRAU — zweite Priorität */
.btn-secondary {
  background: var(--color-primary);      /* #565655 */
  color: #ffffff;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: var(--text-sm);
  border: none;
}
.btn-secondary:hover { box-shadow: 0 6px 16px rgba(86,86,85,0.35); }

/* Ghost — auf hellem Hintergrund */
.btn-ghost {
  background: #ffffff;
  color: var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: var(--text-sm);
  border: 1px solid rgba(86,86,85,0.25);
}
.btn-ghost:hover { box-shadow: 0 6px 16px rgba(86,86,85,0.20); }

/* Ghost Inverted — auf dunklem Hero-Hintergrund (#565655) */
.btn-ghost--inverted {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.4);
}
.btn-ghost--inverted:hover { box-shadow: 0 6px 16px rgba(255,255,255,0.15); }
```

> **Regel:** Hover = nur Schatten, kein Farbwechsel. Roter Button bekommt roten Schatten, grauer Schatten für alle anderen.

---

## Hover-Effekte & Shadows

### Cards (heller / Creme-Hintergrund)

```css
/* Standard — Feature Cards, Bereich-Tiles */
.card { transition: box-shadow var(--transition-fast); }
.card:hover { box-shadow: 0 8px 24px rgba(86,86,85,0.10); }

/* Dezent — Solution Tiles */
.solution-tile:hover { box-shadow: 0 8px 24px rgba(86,86,85,0.08); }
```

Dazu immer: **Icon und Link-Text wechseln auf `var(--color-accent)`** (`#ab0d0e`) bei Hover.

### Interaktive Text-Elemente

```css
/* Nav-Links, Akkordeon-Header, Card-Links */
a:hover, .nav-link:hover, .accordion-header:hover {
  color: var(--color-accent);  /* #ab0d0e — Logo-Rot */
}

/* Prozess-Chips */
.process-chip:hover {
  background: var(--color-primary);
  color: #ffffff;
}
```

### Shadow-Referenz

| Anwendung | Shadow-Wert |
|---|---|
| Button primär rot (Hover) | `0 6px 16px rgba(171,13,14,0.35)` |
| Button sekundär grau (Hover) | `0 6px 16px rgba(86,86,85,0.35)` |
| Button ghost (Hover) | `0 6px 16px rgba(86,86,85,0.20)` |
| Button ghost inverted (Hover) | `0 6px 16px rgba(255,255,255,0.15)` |
| Card Standard (Hover) | `0 8px 24px rgba(86,86,85,0.10)` |
| Card dezent (Hover) | `0 8px 24px rgba(86,86,85,0.08)` |

---

## Section Padding

| Breakpoint | Padding oben/unten |
|---|---|
| Desktop (`> 1024px`) | `var(--space-20)` (80px) Standard · `var(--space-24)` (96px) für große Hero-Sections |
| Mobile/Tablet (`≤ 640px`) | `var(--space-16)` (64px) für beide Größen |

Card-internes Padding: `var(--space-8)` (32px).

---

## Scroll-Reveal

Klasse `.scroll-reveal` an jedes animierbare Element.
Feature-Flag: Klasse `enable-scroll-animations` auf `<body>`.

```css
.scroll-reveal { opacity: 0; transform: translateY(20px); }
body.enable-scroll-animations .scroll-reveal {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
body.enable-scroll-animations .scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

> **Einsatz:** Selektiv — Hero-Titel, Section-Überschriften, erste Card-Reihe. Nicht auf jedem Element, Performance auf Mobile-Geräten im Blick behalten.

---

## Bilder

- **Format:** WebP bevorzugt — `next/image` immer mit `priority` für Hero
- **Hero-Mindestgröße:** 1920×1080px
- **Stil:** Warm, natürlich, authentisch — echte Menschen, Holz, Brot, Biergarten-Atmosphäre. Kein Stock-Photo-Feeling, keine generischen Restaurant-Templates
- **Filter:** `filter: saturate(1.1) brightness(0.95)` — leicht wärmer als real, minimal abgedunkelt für Text-Lesbarkeit
- **Placeholder bis echte Fotos:** Unsplash — Biergarten, Brot/Backstube, Catering-Events (warme Töne bevorzugen)

---

## Tone of Voice (Design-relevante Regeln)

- **Swabian Dialect:** Nur in Headlines und Marketing-Copy — niemals in Formularen, Checkout, Rechtstexten
- **Schrift für Dialekt-Taglines:** Logo-SVG eingebettet oder `Playfair Display` kursiv — kein separater Script-Font
- **Beispiele:**
  - `Playfair Display` für: "Frisch aus der Backstube"
  - Swabian in Marketing: "Schnell sei, sonst isch's weg" — als Headline in `Playfair Display`

---

## CSS Custom Properties — Komplette Referenz

```css
:root {
  /* Farben */
  --color-primary:        #565655;
  --color-accent:         #ab0d0e;
  --color-background:     #ffffff;
  --color-surface:        #f7f4f0;
  --color-dark-bg:        #565655;
  --color-text-primary:   #565655;
  --color-text-secondary: #7a7a79;
  --color-text-muted:     #a0a09f;
  --color-border:         rgba(86,86,85,0.15);
  --color-shadow:         rgba(86,86,85,0.12);

  /* Typografie */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* Type Scale */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;

  /* Line Heights */
  --leading-tight:   1.1;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  /* Letter Spacing */
  --tracking-tight:  -0.03em;
  --tracking-normal:  0em;
  --tracking-wide:    0.08em;

  /* Spacing */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Transitions */
  --transition-fast:   0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow:   0.5s ease;
}
```
