# Bilder — Upload-Anleitung

Hier kommen die echten Fotos rein (Format **WebP**). Lege jede Datei mit dem
**exakten Dateinamen** in den passenden Unterordner. Sobald eine korrekt benannte
Datei vorhanden ist und in `web/lib/images.ts` freigeschaltet wurde, wird sie
automatisch über `next/image` eingebunden — bis dahin bleibt der gestreifte
Platzhalter sichtbar.

**Stil laut Design-Guide:** warm, natürlich, authentisch (Holz, Brot, Biergarten-
Atmosphäre). Die Web-Einbindung legt automatisch einen leichten Filter darüber
(`saturate(1.1) brightness(0.95)`) — die Originale also normal/neutral liefern.

> Tipp: WebP, Qualität ~80, sRGB. Bilder müssen nicht größer als die „Zielmaß"-
> Angabe sein; größer schadet nur der Ladezeit.

## Benötigte Dateien

### `hero/` — Startseiten-Hero (mit Priorität geladen)
| Datei | Seitenverhältnis | Zielmaß | Motiv |
|---|---|---|---|
| `startseite-hero.webp` | 16:9 | **1920×1080** | Biergarten-Atmosphäre, goldenes Abendlicht, Brot & Brezel im Vordergrund |

### `home/` — die drei Bereichs-Karten der Startseite
| Datei | Seitenverhältnis | Zielmaß | Motiv |
|---|---|---|---|
| `biergarten.webp` | 4:3 | 1200×900 | Biergarten unter Kastanien, lange Tische |
| `catering.webp` | 4:3 | 1200×900 | Catering-Team beim Aufbau, Buffet |
| `backstube.webp` | 4:3 | 1200×900 | Bäcker schlingt Brezel, Mehlstaub |

### `biergarten/` — Intro-Foto der Biergarten-Seite
| Datei | Seitenverhältnis | Zielmaß | Motiv |
|---|---|---|---|
| `garten.webp` | 4:5 (hoch) | 1000×1250 | Biergarten unter Kastanien, Abendsonne |

### `catering/` — die sechs Beispiel-Menüs
| Datei | Seitenverhältnis | Zielmaß | Motiv |
|---|---|---|---|
| `fingerfood.webp` | 3:2 | 1500×1000 | Fingerfood-Platte, Häppchen |
| `schwaebisches-buffet.webp` | 3:2 | 1500×1000 | Schwäbisches Buffet, Spätzle |
| `bbq.webp` | 3:2 | 1500×1000 | BBQ-Grillstation, Glut |
| `hochzeit.webp` | 3:2 | 1500×1000 | Hochzeitstafel, festlich gedeckt |
| `fruehstueck.webp` | 3:2 | 1500×1000 | Frühstücks-Catering, Körbe |
| `suppenkueche.webp` | 3:2 | 1500×1000 | Suppen- & Eintopf-Station |

### `backstube/` — die sechs Backwaren (Dateiname = Produkt-ID)
| Datei | Seitenverhältnis | Zielmaß | Motiv |
|---|---|---|---|
| `brezel.webp` | 4:3 | 1200×900 | Laugenbrezel, Salzkristalle |
| `briegl.webp` | 4:3 | 1200×900 | Briegl-Paar, bemehlt |
| `koerner.webp` | 4:3 | 1200×900 | Körnerwecken, Saaten |
| `laugen.webp` | 4:3 | 1200×900 | Laugenstange, längs |
| `bauernbrot.webp` | 4:3 | 1200×900 | Bauernbrot, dunkle Kruste |
| `zopf.webp` | 4:3 | 1200×900 | Hefezopf, geflochten |

## Nach dem Hochladen

Sag mir einfach Bescheid, welche Dateien du abgelegt hast — ich schalte sie in
`web/lib/images.ts` frei (eine Zeile pro Bild) und prüfe das Ergebnis. Du kannst
auch nach und nach hochladen; jeder Slot funktioniert unabhängig.
