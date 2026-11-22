/**
 * Auswertung (Prototyp): Typen, Formatierer und Rechenhelfer.
 * Client-sicher (kein Server-Import) — die Daten kommen aus `auswertungMock.ts`
 * (später aus den anonymen `backtag_stats_*`-Tabellen).
 */

export type Weather = "sonnig" | "wechselhaft" | "regen";
export type Range = "8" | "13" | "all";

export const RANGES: { id: Range; label: string }[] = [
  { id: "8", label: "8 Backtage" },
  { id: "13", label: "3 Monate" },
  { id: "all", label: "Dieses Jahr" },
];

export type Ingredient = { id: string; name: string; unit: "kg" | "l"; price: number };
export type RecipeLine = { ing: string; amount: number };
export type Item = {
  id: string;
  name: string;
  tag: "vegan" | "vegetarisch";
  priceHistory: { from: string; price: number }[];
  recipe: RecipeLine[];
};

export type Backtag = {
  date: string;
  label: string;
  short: string;
  month: number;
  weekday: number;
  orders: number;
  units: number;
  revenue: number;
  cost: number;
  notPickedUp: number;
  qty: Record<string, number>;
  weather: Weather;
};

export type CalChip = { kind: "backtag" | "biergarten" | "catering"; text: string; sub?: string; guests?: number };
export type CalDay = { date: string; day: number; weekday: number; chips: CalChip[] };
export type CalWeek = { kw: number; range: string; days: CalDay[] };

export type Data = {
  now: string;
  items: Item[];
  ingredients: Ingredient[];
  backtage: Backtag[];
  /** Bestell-Heatmap: Zeilen Mo–So, Spalten 6 Zeitblöcke (Basisgewichte). */
  heat: number[][];
  /** Kumulierter Bestellanteil in % je Tag (So…Fr), Durchschnitt über alle Backtage. */
  leadCum: number[];
  pairs: { a: string; b: string; share: number }[];
  priceChange: { itemId: string; from: number; to: number; date: string };
  biergarten: { date: string; label: string; weather: Weather; temp: number; guests: number }[];
  forecast: { label: string; temp: number; weather: Weather };
  lastOpening: { date: string; label: string };
  next: {
    date: string;
    label: string;
    deadlineLabel: string;
    hoursLeft: number;
    ordersSoFar: number;
    ordersByDay: number[];
    qty: Record<string, number>;
  };
  catering: {
    pipeline: { neu: number; klaerung: number; zugesagt: number; abgesagt: number };
    avgReplyHours: number;
    upcoming: { date: string; label: string; type: string; guests: number; status: "neu" | "klaerung" | "zugesagt" }[];
    perMonth: { label: string; value: number }[];
  };
  calendar: CalWeek[];
};

export const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
export const MONTHS_LONG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
export const HEAT_COLS = ["6–9", "9–12", "12–15", "15–18", "18–21", "21–24"];
export const HEAT_ROWS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/* ---------- Formatierer ---------- */
const nf0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const n0 = (v: number) => nf0.format(v);
export const n1 = (v: number) => nf1.format(v);
export const eur = (v: number) => `${nf0.format(v)} €`;
export const eur2 = (v: number) => `${nf2.format(v)} €`;
export const pct = (v: number) => `${nf0.format(v)} %`;
export const signedPct = (v: number) => `${v >= 0 ? "+" : "−"}${nf0.format(Math.abs(v))} %`;
export const signedEur = (v: number) => `${v >= 0 ? "+" : "−"}${nf0.format(Math.abs(v))} €`;

/* ---------- Rechenhelfer ---------- */
export const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
export const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);

export function sliceRange(b: Backtag[], r: Range): Backtag[] {
  return r === "all" ? b : b.slice(-Number(r));
}

export function priceAt(item: Item, date: string): number {
  let p = item.priceHistory[0].price;
  for (const h of item.priceHistory) if (h.from <= date) p = h.price;
  return p;
}
export const currentPrice = (item: Item) => item.priceHistory[item.priceHistory.length - 1].price;

export function itemCost(item: Item, ings: Ingredient[]): number {
  return item.recipe.reduce((s, r) => s + r.amount * (ings.find((i) => i.id === r.ing)?.price ?? 0), 0);
}

export type ItemStat = {
  item: Item;
  qty: number;
  revenue: number;
  profit: number;
  price: number;
  cost: number;
  perPiece: number;
  marginPct: number;
  avgQty: number;
};

export function itemStats(bts: Backtag[], data: Data): ItemStat[] {
  return data.items.map((item) => {
    const cost = itemCost(item, data.ingredients);
    let qty = 0;
    let revenue = 0;
    let active = 0;
    for (const b of bts) {
      const q = b.qty[item.id] ?? 0;
      qty += q;
      revenue += q * priceAt(item, b.date);
      if (q > 0) active += 1;
    }
    const price = currentPrice(item);
    return {
      item,
      qty,
      revenue,
      profit: revenue - qty * cost,
      price,
      cost,
      perPiece: price - cost,
      marginPct: ((price - cost) / price) * 100,
      avgQty: active ? qty / active : 0,
    };
  });
}

export type IngredientUse = { ing: Ingredient; amount: number; cost: number };
export function ingredientUsage(qty: Record<string, number>, data: Data): IngredientUse[] {
  const map = new Map<string, number>();
  for (const item of data.items) {
    const q = qty[item.id] ?? 0;
    if (!q) continue;
    for (const r of item.recipe) map.set(r.ing, (map.get(r.ing) ?? 0) + r.amount * q);
  }
  return data.ingredients
    .map((ing) => {
      const amount = map.get(ing.id) ?? 0;
      return { ing, amount, cost: amount * ing.price };
    })
    .filter((u) => u.amount > 0)
    .sort((a, b) => b.cost - a.cost);
}

export function sumQty(bts: Backtag[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of bts) for (const [k, v] of Object.entries(b.qty)) out[k] = (out[k] ?? 0) + v;
  return out;
}

export function formatAmount(ing: Ingredient, amount: number): string {
  if (ing.unit === "kg") return amount < 1 ? `${n0(amount * 1000)} g` : `${n1(amount)} kg`;
  return amount < 1 ? `${n0(amount * 1000)} ml` : `${n1(amount)} l`;
}

export const weatherLabel: Record<Weather, string> = {
  sonnig: "Sonnig & warm",
  wechselhaft: "Wechselhaft",
  regen: "Regen / kalt",
};
