"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getMenu } from "@/lib/menu";
import { getBacktag } from "@/lib/getBacktag";

/**
 * Server Action für die Backstube-Vorbestellung. Öffentlich aufrufbar (kein
 * Login): schreibt über RLS (`backstube_orders_public_insert`) in Supabase.
 *
 * Wichtig: Namen und Einzelpreise werden **serverseitig autoritativ** aus dem
 * Live-Menü übernommen (Client-Preise werden ignoriert) und als JSONB-Snapshot
 * gespeichert. Bestellt wird immer für den aktuell aktiven Backtag; ist keiner
 * aktiv, wird abgelehnt. E-Mail-Bestätigung folgt separat (SMTP offen).
 */

export type OrderResult = { ok: true } | { ok: false; error: string };

export type OrderLineInput = { id: string; qty: number };

export type OrderInput = {
  name: string;
  email: string;
  phone: string;
  note: string;
  items: OrderLineInput[];
  /** Honeypot: von Menschen leer, von Bots oft ausgefüllt. */
  company: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitBackstubeOrder(
  input: OrderInput,
): Promise<OrderResult> {
  try {
    // Honeypot: ausgefüllt → als Spam verwerfen, aber „Erfolg" vortäuschen.
    if (input.company.trim() !== "") return { ok: true };

    const backtag = await getBacktag();
    if (!backtag.active)
      return {
        ok: false,
        error:
          "Aktuell nimmt die Backstube keine Vorbestellungen an. Schau bald wieder vorbei.",
      };

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Bitte gib deinen Namen an." };

    const email = input.email.trim();
    if (email && !EMAIL_RE.test(email))
      return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };

    const phone = input.phone.trim();
    const note = input.note.trim().slice(0, 2000);

    // Autoritatives Live-Menü: id → {name, price}. Empfehlungen sind ebenfalls
    // bestellbar, deshalb Kategorien + Empfehlungen zusammenführen.
    const menu = await getMenu("backstube");
    const catalog = new Map(
      [...menu.categories.flatMap((c) => c.items), ...menu.recommendations].map(
        (i) => [i.id, { name: i.name, price: i.priceValue }] as const,
      ),
    );

    const lines: {
      id: string;
      name: string;
      qty: number;
      unitPrice: number;
    }[] = [];
    for (const raw of input.items) {
      const product = catalog.get(raw.id);
      if (!product) continue; // nicht mehr verfügbar → still überspringen
      const qty = Math.floor(Number(raw.qty));
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) continue;
      lines.push({ id: raw.id, name: product.name, qty, unitPrice: product.price });
    }

    if (lines.length === 0)
      return {
        ok: false,
        error:
          "Dein Warenkorb ist leer oder die Auswahl ist nicht mehr verfügbar.",
      };

    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

    const supabase = await createClient();
    const { error } = await supabase.from("backstube_orders").insert({
      customer_name: name.slice(0, 200),
      email: email ? email.slice(0, 200) : null,
      phone: phone ? phone.slice(0, 60) : null,
      note: note || null,
      items: lines,
      total: Number(total.toFixed(2)),
      backtag_date: backtag.date,
      backtag_label: backtag.dateLabel,
    });
    if (error) throw error;

    // Admin-Bestellübersicht + Backliste sofort aktuell halten.
    revalidatePath("/admin/bestellungen");

    // TODO (blockiert bis SMTP-Zugangsdaten da): Empfangsbestätigung an den
    // Gast (nur wenn E-Mail angegeben) + optional Info an kontakt@kurvenbeck.com.

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? "Die Bestellung konnte nicht gespeichert werden. Bitte versuch es später erneut."
          : "Unbekannter Fehler.",
    };
  }
}
