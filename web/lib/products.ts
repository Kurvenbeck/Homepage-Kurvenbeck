export type Product = {
  id: string;
  name: string;
  price: number;
  badge: string | null;
  desc: string;
  photo: string;
};

/**
 * Backstube-Sortiment. Im Zielzustand aus CMS/Backend (README §8) — hier statisch.
 */
export const products: Product[] = [
  {
    id: "brezel",
    name: "Original Brezel",
    price: 1.2,
    badge: "Klassiker",
    desc: "Von Hand geschlungen, laugengebadet, mit grobem Salz. Außen knusprig, innen weich.",
    photo: "Foto: Laugenbrezel, Salzkristalle — 4:3",
  },
  {
    id: "briegl",
    name: "Briegl",
    price: 0.95,
    badge: "Schwäbisch",
    desc: "Das schwäbische Brötchen schlechthin — rustikale Kruste, lockere Krume. Paarweise gebacken.",
    photo: "Foto: Briegl-Paar, bemehlt — 4:3",
  },
  {
    id: "koerner",
    name: "Körnerwecken",
    price: 1.1,
    badge: null,
    desc: "Saftiges Brötchen mit Sonnenblumen-, Lein- und Sesamkernen. Hält lange frisch.",
    photo: "Foto: Körnerwecken, Saaten — 4:3",
  },
  {
    id: "laugen",
    name: "Laugenstange",
    price: 1.4,
    badge: null,
    desc: "Lange Laugenstange, ideal aufgeschnitten mit Butter oder herzhaftem Belag.",
    photo: "Foto: Laugenstange, längs — 4:3",
  },
  {
    id: "bauernbrot",
    name: "Bauernbrot",
    price: 4.8,
    badge: "Steinofen",
    desc: "Kräftiges Mischbrot aus dem Steinofen, lange Teigführung. Halber oder ganzer Laib.",
    photo: "Foto: Bauernbrot, dunkle Kruste — 4:3",
  },
  {
    id: "zopf",
    name: "Sonntagszopf",
    price: 3.6,
    badge: "Nur Sa",
    desc: "Buttriger Hefezopf mit Hagelzucker — der Klassiker fürs Wochenend-Frühstück.",
    photo: "Foto: Hefezopf, geflochten — 4:3",
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);

/** Preisformat de-DE mit €, z. B. "1,20 €". */
export function formatEUR(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}
