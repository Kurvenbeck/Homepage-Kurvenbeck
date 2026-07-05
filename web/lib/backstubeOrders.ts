import { createClient } from "@/utils/supabase/server";

/**
 * Loader für die Backstube-Vorbestellungen (Admin). Liest über die eingeloggte
 * Sitzung; RLS (`backstube_orders_admin_read`) gibt die Zeilen nur Admins frei.
 *
 * Liefert zwei Sichten:
 *   1. `orders` — jede Bestellung mit Name + Positionen (neu zuerst).
 *   2. `bakingList` — aggregiert über alle **offenen** Bestellungen, wie viel
 *      von jedem Produkt insgesamt zu backen ist (das „Killer-Feature").
 */

export type OrderStatus = "neu" | "erledigt";

export type OrderLine = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type BackstubeOrder = {
  id: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  items: OrderLine[];
  total: number;
  backtagLabel: string | null;
  status: OrderStatus;
  createdAt: string;
};

export type BakingListEntry = { name: string; qty: number };

export type BackstubeOrdersView = {
  orders: BackstubeOrder[];
  /** Aggregierte Backliste über alle offenen Bestellungen, Menge absteigend. */
  bakingList: BakingListEntry[];
  openCount: number;
};

type Row = {
  id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  items: OrderLine[] | null;
  total: number | string;
  backtag_label: string | null;
  status: OrderStatus;
  created_at: string;
};

export async function getBackstubeOrders(): Promise<BackstubeOrdersView> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("backstube_orders")
    .select(
      "id, customer_name, email, phone, note, items, total, backtag_label, status, created_at",
    )
    // Offene zuerst, innerhalb dessen die jüngsten oben.
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) throw error;

  const orders: BackstubeOrder[] = (data ?? []).map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    note: r.note,
    items: Array.isArray(r.items) ? r.items : [],
    total: typeof r.total === "string" ? Number(r.total) : r.total,
    backtagLabel: r.backtag_label,
    status: r.status,
    createdAt: r.created_at,
  }));

  // Aggregation nur über offene Bestellungen (die aktuell zu backen sind).
  const agg = new Map<string, BakingListEntry>();
  for (const order of orders) {
    if (order.status !== "neu") continue;
    for (const line of order.items) {
      const key = line.id || line.name;
      const existing = agg.get(key);
      if (existing) existing.qty += line.qty;
      else agg.set(key, { name: line.name, qty: line.qty });
    }
  }

  const bakingList = [...agg.values()].sort((a, b) => b.qty - a.qty);
  const openCount = orders.filter((o) => o.status === "neu").length;

  return { orders, bakingList, openCount };
}
