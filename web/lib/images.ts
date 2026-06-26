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
  homeHero: null as Img | null, // /images/hero/startseite-hero.webp (1920×1080)
  homeBiergarten: null as Img | null, // /images/home/biergarten.webp (4:3)
  homeCatering: null as Img | null, // /images/home/catering.webp (4:3)
  homeBackstube: null as Img | null, // /images/home/backstube.webp (4:3)

  // Biergarten
  biergartenGarten: null as Img | null, // /images/biergarten/garten.webp (4:5)

  // Catering (3:2)
  cateringFingerfood: null as Img | null, // /images/catering/fingerfood.webp
  cateringBuffet: null as Img | null, // /images/catering/schwaebisches-buffet.webp
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
  brezel: null,
  briegl: null,
  koerner: null,
  laugen: null,
  bauernbrot: null,
  zopf: null,
};
