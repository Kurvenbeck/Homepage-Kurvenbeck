"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { BACKTAG_KEYS, DEADLINE_AT_RE } from "@/lib/backtag";
import type { OrderStatus } from "@/lib/backstubeOrders";

/**
 * Admin-Aktionen für die Backstube-Vorbestellungen: aktiven Backtag pflegen und
 * Bestellstatus umschalten. Laufen mit der eingeloggten Sitzung; Autorisierung
 * erzwingt RLS (`is_admin()`), kein service_role.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES: OrderStatus[] = ["neu", "erledigt"];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return supabase;
}

export type BacktagInput = {
  active: boolean;
  date: string;
  deadlineText: string;
  /** Bestellschluss „yyyy-MM-ddTHH:mm" (Berliner Ortszeit) oder leer. */
  deadlineAt: string;
  pickupText: string;
};

export async function updateBacktag(input: BacktagInput): Promise<ActionResult> {
  try {
    const supabase = await requireUser();

    const date = input.date.trim();
    if (input.active) {
      // Aktiv nur mit gültigem Datum sinnvoll (Snapshot/Anzeige brauchen es).
      if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date)))
        return {
          ok: false,
          error: "Bitte ein gültiges Backtag-Datum wählen, um zu aktivieren.",
        };
    }

    const deadlineAt = input.deadlineAt.trim();
    if (deadlineAt && !DEADLINE_AT_RE.test(deadlineAt))
      return { ok: false, error: "Bestellschluss: ungültiges Datum/Uhrzeit." };

    const now = new Date().toISOString();
    const { error } = await supabase.from("site_settings").upsert(
      [
        {
          key: BACKTAG_KEYS.active,
          value: input.active ? "true" : "false",
          updated_at: now,
        },
        { key: BACKTAG_KEYS.date, value: date, updated_at: now },
        {
          key: BACKTAG_KEYS.deadlineText,
          value: input.deadlineText.trim().slice(0, 100),
          updated_at: now,
        },
        { key: BACKTAG_KEYS.deadlineAt, value: deadlineAt, updated_at: now },
        {
          key: BACKTAG_KEYS.pickupText,
          value: input.pickupText.trim().slice(0, 100),
          updated_at: now,
        },
      ],
      { onConflict: "key" },
    );
    if (error) throw error;

    // Backstube-Seite + Admin sofort aktuell.
    revalidatePath("/backstube");
    revalidatePath("/admin/bestellungen");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unbekannter Fehler.",
    };
  }
}

export async function setBackstubeOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  try {
    if (!STATUSES.includes(status))
      return { ok: false, error: "Ungültiger Status." };

    const supabase = await requireUser();
    const { error } = await supabase
      .from("backstube_orders")
      .update({ status })
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/bestellungen");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unbekannter Fehler.",
    };
  }
}
