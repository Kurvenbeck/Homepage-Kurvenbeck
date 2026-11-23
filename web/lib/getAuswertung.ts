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
};

export type StatItem = {
  date: string;
  id: string;
  name: string;
  qty: number;
  revenue: number;
};

export type AuswertungData = {
  days: StatDay[]; // alt → neu
  items: StatItem[];
  next: {
    openOrders: number;
    bakingList: BakingListEntry[];
  };
  catering: { open: number };
};

type DayRow = { backtag_date: string; orders_count: number; items_count: number; revenue: number | string };
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

  const [dayRes, itemRes, orders, catering] = await Promise.all([
    supabase
      .from("backtag_stats_day")
      .select("backtag_date, orders_count, items_count, revenue")
      .order("backtag_date", { ascending: true })
      .returns<DayRow[]>(),
    supabase
      .from("backtag_stats_item")
      .select("backtag_date, menu_item_id, name, qty, revenue")
      .returns<ItemRow[]>(),
    getBackstubeOrders(),
    getCateringRequests(),
  ]);

  if (dayRes.error) throw dayRes.error;
  if (itemRes.error) throw itemRes.error;

  return {
    days: (dayRes.data ?? []).map((r) => ({
      date: r.backtag_date,
      orders: r.orders_count,
      units: r.items_count,
      revenue: num(r.revenue),
    })),
    items: (itemRes.data ?? []).map((r) => ({
      date: r.backtag_date,
      id: r.menu_item_id,
      name: r.name,
      qty: r.qty,
      revenue: num(r.revenue),
    })),
    next: { openOrders: orders.openCount, bakingList: orders.bakingList },
    catering: { open: catering.filter((c) => c.status === "neu").length },
  };
}
