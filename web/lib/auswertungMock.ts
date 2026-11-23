import {
  type Backtag,
  type CalWeek,
  type Data,
  type Ingredient,
  type Item,
  type Weather,
  WEEKDAYS,
  currentPrice,
  itemCost,
  priceAt,
} from "@/lib/auswertung";

/**
 * Beispieldaten für den Auswertungs-Prototyp. Deterministisch (Seed), damit Server-
 * und Client-Render identisch sind. Ersetzt später: Abfrage der `backtag_stats_*`.
 */

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INGREDIENTS: Ingredient[] = [
  { id: "weizen", name: "Weizenmehl 550", unit: "kg", price: 0.85 },
  { id: "dinkel", name: "Dinkelmehl 630", unit: "kg", price: 1.8 },
  { id: "roggen", name: "Roggenmehl 997", unit: "kg", price: 1.1 },
  { id: "butter", name: "Butter", unit: "kg", price: 9.2 },
  { id: "hefe", name: "Frischhefe", unit: "kg", price: 4 },
  { id: "salz", name: "Salz", unit: "kg", price: 0.6 },
  { id: "kuerbis", name: "Kürbiskerne", unit: "kg", price: 8.5 },
  { id: "zwiebel", name: "Zwiebeln", unit: "kg", price: 1.6 },
  { id: "natron", name: "Natron (Lauge)", unit: "kg", price: 3 },
  { id: "milch", name: "Milch", unit: "l", price: 1.1 },
  { id: "mohn", name: "Mohn", unit: "kg", price: 12 },
  { id: "oel", name: "Olivenöl", unit: "l", price: 9 },
];

const ITEMS: Item[] = [
  {
    id: "brezel", name: "Laugenbrezel", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 1.4 }],
    recipe: [
      { ing: "weizen", amount: 0.075 }, { ing: "hefe", amount: 0.003 },
      { ing: "salz", amount: 0.0015 }, { ing: "butter", amount: 0.004 }, { ing: "natron", amount: 0.002 },
    ],
  },
  {
    id: "dinkel", name: "Dinkelvollkornbrot", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 5.9 }],
    recipe: [{ ing: "dinkel", amount: 0.75 }, { ing: "hefe", amount: 0.01 }, { ing: "salz", amount: 0.014 }],
  },
  {
    id: "roggen", name: "Roggenmischbrot", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 4.5 }, { from: "2026-09-20", price: 4.8 }],
    recipe: [
      { ing: "roggen", amount: 0.5 }, { ing: "weizen", amount: 0.25 },
      { ing: "salz", amount: 0.015 }, { ing: "hefe", amount: 0.008 },
    ],
  },
  {
    id: "seelen", name: "Seelen", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 2.2 }],
    recipe: [{ ing: "dinkel", amount: 0.09 }, { ing: "salz", amount: 0.002 }, { ing: "hefe", amount: 0.003 }],
  },
  {
    id: "zopf", name: "Butterzopf", tag: "vegetarisch",
    priceHistory: [{ from: "2026-01-01", price: 4.5 }],
    recipe: [
      { ing: "weizen", amount: 0.35 }, { ing: "butter", amount: 0.06 },
      { ing: "milch", amount: 0.12 }, { ing: "hefe", amount: 0.015 },
    ],
  },
  {
    id: "zwiebelkuchen", name: "Zwiebelkuchen", tag: "vegetarisch",
    priceHistory: [{ from: "2026-01-01", price: 3.8 }],
    recipe: [
      { ing: "weizen", amount: 0.3 }, { ing: "zwiebel", amount: 0.5 },
      { ing: "butter", amount: 0.04 }, { ing: "milch", amount: 0.1 }, { ing: "hefe", amount: 0.01 },
    ],
  },
  {
    id: "mohn", name: "Mohnschnecke", tag: "vegetarisch",
    priceHistory: [{ from: "2026-01-01", price: 2.4 }],
    recipe: [
      { ing: "weizen", amount: 0.09 }, { ing: "butter", amount: 0.03 },
      { ing: "mohn", amount: 0.03 }, { ing: "milch", amount: 0.03 },
    ],
  },
  {
    id: "focaccia", name: "Focaccia", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 3.9 }],
    recipe: [
      { ing: "weizen", amount: 0.4 }, { ing: "oel", amount: 0.05 },
      { ing: "salz", amount: 0.008 }, { ing: "hefe", amount: 0.006 },
    ],
  },
  {
    id: "kuerbiskern", name: "Kürbiskernbrot", tag: "vegan",
    priceHistory: [{ from: "2026-01-01", price: 5.5 }],
    recipe: [
      { ing: "weizen", amount: 0.2 }, { ing: "roggen", amount: 0.2 },
      { ing: "kuerbis", amount: 0.08 }, { ing: "salz", amount: 0.01 }, { ing: "hefe", amount: 0.005 },
    ],
  },
];

const POP: Record<string, number> = {
  brezel: 100, dinkel: 62, roggen: 55, seelen: 48, zopf: 40,
  zwiebelkuchen: 30, mohn: 26, focaccia: 22, kuerbiskern: 18,
};
const SEASON = [0.85, 0.85, 0.9, 1.0, 1.05, 0.95, 0.8, 0.75, 0.95, 1.1, 1.2, 1.3];
const LEAD_BASE = [10, 21, 34, 50, 72, 100];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const short = (d: Date) => `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;

export function buildMockData(): Data {
  const rand = rng(20261122);

  /* ---- Backtage: Samstage + ein paar Freitage ---- */
  const skip = new Set(["2026-05-23", "2026-08-15", "2026-08-22"]);
  const dates: Date[] = [];
  for (let t = Date.UTC(2026, 0, 10); t <= Date.UTC(2026, 10, 21); t += 7 * 86400000) {
    if (!skip.has(iso(new Date(t)))) dates.push(new Date(t));
  }
  for (const f of ["2026-04-03", "2026-05-15"]) dates.push(new Date(f + "T00:00:00Z"));
  dates.sort((a, b) => a.getTime() - b.getTime());

  const backtage: Backtag[] = dates.map((d, idx) => {
    const month = d.getUTCMonth();
    const date = iso(d);
    const growth = 0.75 + idx * 0.008;
    const orders = Math.max(14, Math.round(28 * growth * SEASON[month] * (0.88 + rand() * 0.24)));
    const w = rand();
    const sunny = month >= 4 && month <= 8 ? 0.55 : month >= 3 && month <= 9 ? 0.3 : 0.08;
    const weather: Weather = w < sunny ? "sonnig" : w < sunny + 0.4 ? "wechselhaft" : "regen";
    const weatherFx = weather === "regen" ? 1.05 : weather === "sonnig" ? 0.96 : 1;
    const units = orders * 5.5 * weatherFx;
    const pops = ITEMS.map((it) => {
      if (it.id === "zwiebelkuchen" && (month < 8 || month > 10)) return 0;
      const afterRise = it.id === "roggen" && date >= "2026-09-20" ? 0.97 : 1;
      return POP[it.id] * afterRise * (0.75 + rand() * 0.5);
    });
    const popSum = pops.reduce((s, v) => s + v, 0);
    const qty: Record<string, number> = {};
    let revenue = 0;
    let cost = 0;
    let total = 0;
    ITEMS.forEach((it, i) => {
      const q = Math.round((pops[i] / popSum) * units);
      if (q > 0) qty[it.id] = q;
      revenue += q * priceAt(it, date);
      cost += q * itemCost(it, INGREDIENTS);
      total += q;
    });
    const notPickedUp = Math.round(orders * 0.04 * (0.4 + rand() * 1.6));
    return {
      date,
      label: `${WEEKDAYS[d.getUTCDay()]} ${short(d)}`,
      short: short(d),
      month,
      weekday: d.getUTCDay(),
      orders,
      units: total,
      revenue: Math.round(revenue),
      cost: Math.round(cost * 100) / 100,
      notPickedUp,
      qty,
      weather,
    };
  });

  /* ---- Biergarten-Tage + Gäste (neue Tageszahl aus dem Admin) ---- */
  const bier: Data["biergarten"] = [];
  const base: Record<Weather, number> = { sonnig: 125, wechselhaft: 78, regen: 30 };
  const tempOf: Record<Weather, number> = { sonnig: 24, wechselhaft: 16, regen: 9 };
  for (let t = Date.UTC(2026, 3, 10); t <= Date.UTC(2026, 9, 31); t += 3.5 * 86400000) {
    const d = new Date(Math.round(t / 86400000) * 86400000);
    const m = d.getUTCMonth();
    const r = rand();
    const sun = m >= 5 && m <= 7 ? 0.55 : 0.3;
    const wx: Weather = r < sun ? "sonnig" : r < sun + 0.4 ? "wechselhaft" : "regen";
    bier.push({
      date: iso(d),
      label: `${WEEKDAYS[d.getUTCDay()]} ${short(d)}`,
      weather: wx,
      temp: Math.round(tempOf[wx] + (rand() - 0.5) * 6),
      guests: Math.round(base[wx] * (0.85 + rand() * 0.3)),
    });
  }

  /* ---- Heatmap + Bestellverlauf ---- */
  const heat = [
    [1, 3, 2, 3, 6, 4],
    [1, 2, 2, 3, 5, 3],
    [1, 3, 3, 4, 8, 5],
    [1, 4, 3, 5, 12, 7],
    [2, 6, 4, 5, 3, 0],
    [1, 2, 1, 1, 2, 1],
    [1, 3, 3, 5, 11, 9],
  ];

  /* ---- Nächster Backtag (Donnerstag, 26.11., 10 Uhr) ---- */
  const next: Data["next"] = {
    date: "2026-11-28",
    label: "Samstag, 28. November",
    deadlineLabel: "Freitag, 18 Uhr",
    hoursLeft: 32,
    ordersSoFar: 22,
    ordersByDay: [4, 8, 13, 20],
    qty: {
      brezel: 41, dinkel: 12, roggen: 10, seelen: 14, zopf: 8,
      zwiebelkuchen: 6, mohn: 7, focaccia: 3, kuerbiskern: 2,
    },
  };

  /* ---- Kalender: 4 Wochen ab Mo 23.11. ---- */
  const evt: Record<string, { kind: "backtag" | "biergarten" | "catering"; text: string; sub?: string; guests?: number }[]> = {
    "2026-11-27": [{ kind: "biergarten", text: "Biergarten", sub: "17–22 Uhr" }],
    "2026-11-28": [{ kind: "backtag", text: "Backtag" }, { kind: "biergarten", text: "Biergarten", sub: "12–22 Uhr" }],
    "2026-12-04": [{ kind: "biergarten", text: "Biergarten", sub: "17–22 Uhr" }],
    "2026-12-05": [{ kind: "backtag", text: "Backtag" }, { kind: "catering", text: "Catering", sub: "80 Gäste", guests: 80 }],
    "2026-12-11": [{ kind: "biergarten", text: "Biergarten", sub: "17–22 Uhr" }],
    "2026-12-12": [{ kind: "backtag", text: "Backtag" }],
    "2026-12-18": [{ kind: "catering", text: "Catering", sub: "35 Gäste", guests: 35 }],
    "2026-12-19": [{ kind: "backtag", text: "Backtag" }, { kind: "catering", text: "Catering", sub: "60 Gäste", guests: 60 }],
  };
  const calendar: CalWeek[] = [];
  for (let w = 0; w < 4; w++) {
    const monday = Date.UTC(2026, 10, 23 + w * 7);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday + i * 86400000);
      return { date: iso(d), day: d.getUTCDate(), weekday: d.getUTCDay(), chips: evt[iso(d)] ?? [] };
    });
    const first = new Date(monday);
    const last = new Date(monday + 6 * 86400000);
    calendar.push({ kw: 48 + w, range: `${short(first)} – ${short(last)}`, days });
  }

  return {
    now: "2026-11-26",
    items: ITEMS,
    ingredients: INGREDIENTS,
    backtage,
    heat,
    leadCum: LEAD_BASE,
    pairs: [
      { a: "Laugenbrezel", b: "Seelen", share: 41 },
      { a: "Dinkelvollkornbrot", b: "Butterzopf", share: 28 },
      { a: "Roggenmischbrot", b: "Laugenbrezel", share: 26 },
      { a: "Butterzopf", b: "Mohnschnecke", share: 19 },
      { a: "Zwiebelkuchen", b: "Roggenmischbrot", share: 14 },
    ],
    priceChange: { itemId: "roggen", from: 4.5, to: currentPrice(ITEMS[2]), date: "2026-09-20" },
    biergarten: bier,
    forecast: { label: "Sa 28.11.", temp: 6, weather: "regen" },
    lastOpening: { date: "2026-10-31", label: "Sa 31.10." },
    next,
    catering: {
      pipeline: { neu: 3, klaerung: 2, zugesagt: 4, abgesagt: 1 },
      avgReplyHours: 5,
      upcoming: [
        { date: "2026-12-05", label: "Sa 5.12.", type: "Firmen-Weihnachtsfeier", guests: 80, status: "zugesagt" },
        { date: "2026-12-18", label: "Fr 18.12.", type: "Geburtstag", guests: 35, status: "klaerung" },
        { date: "2026-12-19", label: "Sa 19.12.", type: "Hochzeit", guests: 60, status: "neu" },
      ],
      perMonth: [
        { label: "Jun", value: 2 }, { label: "Jul", value: 4 }, { label: "Aug", value: 3 },
        { label: "Sep", value: 5 }, { label: "Okt", value: 6 }, { label: "Nov", value: 4 },
      ],
    },
    calendar,
  };
}
