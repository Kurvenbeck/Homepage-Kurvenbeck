/**
 * Foto-Registry. Jeder Slot ist anfangs `null` → es wird der beschriftete
 * Platzhalter angezeigt. Sobald die passende WebP-Datei unter `public/images/...`
 * liegt (siehe public/images/README.md), die Zeile von `null` auf ein Objekt
 * mit `src` + aussagekräftigem `alt` setzen — dann bindet `<Photo>` das echte
 * Bild über `next/image` ein.
 */
export type Img = { src: string; alt: string };

export const photos = {
  // Startseite
  homeHero: { src: "/images/hero/startseite-hero.webp", alt: "Kurvenbeck – Gasthaus und Biergarten im Abendlicht" },
  homeBiergarten: { src: "/images/home/startseite-hero.webp", alt: "Biergarten am Kurvenbeck – gemütliche Terrasse im Freien" },
  homeCatering: { src: "/images/catering/catering.webp", alt: "Schwäbisches Buffet mit Spätzle, Schnitzel und Braten – Kurvenbeck Catering" },
  homeBackstube: { src: "/images/backstube/backstube.webp", alt: "Frische Laugenbrezel und Körnerwecken aus der Kurvenbeck-Backstube" },

  // Biergarten
  biergartenGarten: { src: "/images/biergarten/garten.webp", alt: "Biergarten Kurvenbeck – Außenbereich mit Bäumen und Abendsonne" },

  // Catering (3:2)
  cateringFingerfood: null as Img | null, // /images/catering/fingerfood.webp
  cateringBuffet: { src: "/images/catering/catering.webp", alt: "Schwäbisches Buffet mit Spätzle, Schnitzel, Braten und Gemüse" },
  cateringBbq: null as Img | null, // /images/catering/bbq.webp
  cateringHochzeit: null as Img | null, // /images/catering/hochzeit.webp
  cateringFruehstueck: null as Img | null, // /images/catering/fruehstueck.webp
  cateringSuppenkueche: null as Img | null, // /images/catering/suppenkueche.webp
} satisfies Record<string, Img | null>;

/**
 * Backstube-Fotos je Produkt-ID. Dateiname = `<id>.webp` (4:3).
 * Beispiel: für die Brezel `brezel: { src: "/images/backstube/brezel.webp", alt: "…" }`.
 */
export const backstubePhotos: Record<string, Img | null> = {
  brezel: { src: "/images/backstube/backstube.webp", alt: "Frische Laugenbrezel aus der Kurvenbeck-Backstube" },
  briegl: null,
  koerner: { src: "/images/backstube/backstube.webp", alt: "Körnerwecken aus der Kurvenbeck-Backstube" },
  laugen: null,
  bauernbrot: null,
  zopf: null,
};
