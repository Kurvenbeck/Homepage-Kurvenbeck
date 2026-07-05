"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { CateringStatus } from "@/lib/catering";

/**
 * Status-Aktion für den Catering-Posteingang. Läuft mit der eingeloggten Sitzung,
 * Autorisierung erzwingt RLS (`is_admin()`), kein service_role.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const STATUSES: CateringStatus[] = ["neu", "erledigt"];

export async function setCateringRequestStatus(
  id: string,
  status: CateringStatus,
): Promise<ActionResult> {
  try {
    if (!STATUSES.includes(status))
      return { ok: false, error: "Ungültiger Status." };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Nicht angemeldet." };

    const { error } = await supabase
      .from("catering_requests")
      .update({ status })
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catering");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unbekannter Fehler.",
    };
  }
}
