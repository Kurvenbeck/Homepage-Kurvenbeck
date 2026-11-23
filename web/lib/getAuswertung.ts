import { createClient } from "@/utils/supabase/server";
import { getBackstubeOrders, type BakingListEntry } from "@/lib/backstubeOrders";
import { getCateringRequests } from "@/lib/catering";

/**
 * Loader für die Auswertung (Admin, Phase 1). Liest die anonymen
 * `backtag_stats_*`-Tabellen (RLS: nur Admin) plus den Live-Stand des nächsten
 * Backtags. Typen sind absichtlich schlicht und client-sicher.
 */

export type StatDay = {
  date: string; // ISO yyyy-mm-dd
  orders: number;
  units: number;
  revenue: number;
  /** Bestellungen je Wochentag+Stunde: "<isodow 1-7>_<stunde>" → Anzahl. */
  slots: Record<string, number>;
  /** Bestellungen je Vorlauf in Tagen vor dem Backtag (0…7, 7 = 7+ Tage). */
  leadDays: Record<string, number>;
};

export type StatItem = {
  date: string;
  id: string;
  name: string;
  qty: number;
  revenue: number;
};

export type StatPair = { date: string; a: string; b: string; count: number };

export type AuswertungData = {
  days: StatDay[]; // alt → neu
  items: StatItem[];
  pairs: StatPair[];
  next: {
    openOrders: number;
    bakingList: BakingListEntry[];
  };
  catering: { open: number };
};

type DayRow = {
  backtag_date: string;
  orders_count: number;
  items_count: number;
  revenue: number | string;
  slots: Record<string, number> | null;
  lead_days: Record<string, number> | null;
};
type PairRow = { backtag_date: string; item_a: string; item_b: string; orders_count: number };
type ItemRow = {
  backtag_date: string;
  menu_item_id: string;
  name: string;
  qty: number;
  revenue: number | string;
};

const num = (v: number | string) => (typeof v === "string" ? Number(v) : v);

export async function getAuswertung(): Promise<AuswertungData> {
  const supabase = await createClient();

  const [dayRes, itemRes, pairRes, orders, catering] = await Promise.all([
    supabase
      .from("backtag_stats_day")
      .select("backtag_date, orders_count, items_count, revenue, slots, lead_days")
      .order("backtag_date", { ascending: true })
      .returns<DayRow[]>(),
    supabase
      .from("backtag_stats_item")
      .select("backtag_date, menu_item_id, name, qty, revenue")
      .returns<ItemRow[]>(),
    supabase
      .from("backtag_stats_pair")
      .select("backtag_date, item_a, item_b, orders_count")
      .returns<PairRow[]>(),
    getBackstubeOrders(),
    getCateringRequests(),
  ]);

  if (dayRes.error) throw dayRes.error;
  if (itemRes.error) throw itemRes.error;
  if (pairRes.error) throw pairRes.error;

  return {
    days: (dayRes.data ?? []).map((r) => ({
      date: r.backtag_date,
      orders: r.orders_count,
      units: r.items_count,
      revenue: num(r.revenue),
      slots: r.slots ?? {},
      leadDays: r.lead_days ?? {},
    })),
    items: (itemRes.data ?? []).map((r) => ({
      date: r.backtag_date,
      id: r.menu_item_id,
      name: r.name,
      qty: r.qty,
      revenue: num(r.revenue),
    })),
    pairs: (pairRes.data ?? []).map((r) => ({
      date: r.backtag_date,
      a: r.item_a,
      b: r.item_b,
      count: r.orders_count,
    })),
    next: { openOrders: orders.openCount, bakingList: orders.bakingList },
    catering: { open: catering.filter((c) => c.status === "neu").length },
  };
}
