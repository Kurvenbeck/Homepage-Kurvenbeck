# CLAUDE.md — Projekt Kurvenbeck

Arbeitsanweisungen für Claude Code in diesem Projekt. Diese Datei wird zu Beginn
jeder Session gelesen.

## Projekt

Web-Präsenz für den Familienbetrieb **Kurvenbeck** (seit 1978) mit drei Bereichen:
Biergarten, Catering, Backstube. Visuelle Richtung: Option C „Warm & Handwerklich".
Quellen: `README.md` (Handoff) + `kurvenbeck-design-guide Kopie.md` (Design-Tokens,
Single Source of Truth). Die `*.html`-Dateien im Root sind **Design-Referenzen**,
kein auszuliefernder Code.

Die lauffähige App liegt unter **`web/`** (Next.js App Router, TypeScript).

## Sprache & Anrede (verbindlich)

- Sämtliche **nutzersichtbaren Texte sind auf Deutsch**.
- **Anrede durchgängig in der Du-Form (informell) — niemals „Sie".**
  Also `du / dein / dir / dich`, nicht `Sie / Ihr / Ihnen`.
  - „du" wird **kleingeschrieben** (Default), außer am Satzanfang.
  - Beispiele:
    - ❌ „Sagen Sie uns kurz, was Sie vorhaben." → ✅ „Sag uns kurz, was du vorhast."
    - ❌ „Wir melden uns bei Ihnen." → ✅ „Wir melden uns bei dir."
    - ❌ „Ihr Fest, unser Handwerk." → ✅ „Dein Fest, unser Handwerk."
  - Gilt für **alle** Komponenten, Seiten, Formular-Labels/-Platzhalter,
    Buttons, Erfolgs-/Fehlermeldungen und Meta-Beschreibungen.
- **Schwäbischer Dialekt** nur in Headlines / Marketing-Copy (z. B. „Hock di na.",
  „Schnell sei, sonst isch's weg.") — **nie** in Formularen, Checkout oder Rechtstexten.
- **Rechtstexte** (Impressum, Datenschutz, AGB) dürfen sachlich-neutral formuliert
  sein; wo eine Anrede vorkommt, ebenfalls Du-Form.

## Design

- Alle Maße, Farben, Typo, Abstände kommen aus den Tokens
  (`web/app/globals.css`, gespiegelt aus `assets/tokens.css` + Design-Guide).
  Keine „magischen" Werte — immer die `--token`-Variablen verwenden.
- High-Fidelity: pixelgenau zur Referenz.

## Bilder

- Echte Fotos als **WebP** in `web/public/images/...` (Struktur + Namen:
  `web/public/images/README.md`). Eingebunden über `<Photo>` + Registry
  `web/lib/images.ts`. Leere Slots zeigen den beschrifteten Platzhalter —
  Slot erst freischalten, wenn die Datei existiert (sonst 404).

## Kontaktdaten & Konfiguration

- Kontaktdaten (v. a. Telefonnummer) **nicht hardcoden**. Einzige Quelle:
  `web/lib/siteSettings.ts` (`siteSettings.contactPhone` + Helfer `telHref`,
  `whatsappHref`). Footer und Biergarten-CTAs lesen daraus.
- Geplant: Werte aus Supabase-Tabelle `site_settings` (key `contact_phone`)
  laden — Details/Schritte in `web/TODO.md`.
- `wa.me`-Nummern brauchen internationales Format ohne führende Null; der
  Helfer leitet das aus `e164` ab.

## Icons

- Icon-Set: **`@tabler/icons-react`** (tree-shakeable). Beispiel:
  `import { IconPhone, IconBrandWhatsapp } from "@tabler/icons-react"` →
  `<IconPhone size={18} stroke={1.75} aria-hidden />`. In Buttons sorgt die
  `.btn`-Klasse (`gap`) für den Abstand.

## Offene Aufgaben

Siehe `web/TODO.md` (Supabase-Anbindung, echte Fotos/Logo, Formular-/Bestell-
Backend usw.).

## Befehle (im Ordner `web/`)

```bash
npm run dev      # Dev-Server (http://localhost:3000)
npm run build    # Production-Build inkl. Typecheck + Lint
npm start        # Production-Server
```

## Konventionen

- App Router, TypeScript. Interaktive Teile sind Client-Komponenten
  (`"use client"`): `SiteHeader`, `CartContext`/Warenkorb, `CateringForm`.
- Gemeinsame Bausteine in `web/components/`, Daten/Helfer in `web/lib/`.
- Vor dem Abschluss einer Aufgabe `npm run build` grün halten.
