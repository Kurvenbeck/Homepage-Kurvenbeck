"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { assertArea } from "@/lib/menuAreas";

/**
 * Schreib-Aktionen für Öffnungstage (Besenwirtschaft). Wie beim Menü: läuft mit der
 * eingeloggten Sitzung, Autorisierung erzwingt RLS (`is_admin()`), kein service_role.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

export type OpeningInput = {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  openTime: string;
  /** HH:MM */
  closeTime: string;
  note: string;
};

async function getSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return supabase;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/** Prüft Datum + Zeiten; liefert normalisierte Werte oder eine Fehlermeldung. */
function validate(
  input: OpeningInput,
): { ok: true; value: OpeningInput } | { ok: false; error: string } {
  const date = input.date.trim();
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date)))
    return { ok: false, error: "Bitte ein gültiges Datum wählen." };

  const openTime = input.openTime.trim();
  const closeTime = input.closeTime.trim();
  if (!TIME_RE.test(openTime) || !TIME_RE.test(closeTime))
    return { ok: false, error: "Bitte gültige Uhrzeiten angeben (z. B. 11:00)." };
  if (openTime >= closeTime)
    return { ok: false, error: "Die Schließzeit muss nach der Öffnungszeit liegen." };

  return { ok: true, value: { date, openTime, closeTime, note: input.note.trim() } };
}

function revalidate(area: string) {
  revalidatePath(`/${area}`);
  revalidatePath("/admin/oeffnungszeiten");
}

function fail(error: unknown): ActionResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Unbekannter Fehler.",
  };
}

export async function createOpeningDay(
  area: string,
  input: OpeningInput,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const v = validate(input);
    if (!v.ok) return v;

    const { error } = await supabase.from("opening_days").insert({
      area: menuArea,
      date: v.value.date,
      open_time: v.value.openTime,
      close_time: v.value.closeTime,
      note: v.value.note || null,
    });
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOpeningDay(
  area: string,
  id: string,
  input: OpeningInput,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const v = validate(input);
    if (!v.ok) return v;

    const { error } = await supabase
      .from("opening_days")
      .update({
        date: v.value.date,
        open_time: v.value.openTime,
        close_time: v.value.closeTime,
        note: v.value.note || null,
      })
      .eq("id", id);
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteOpeningDay(
  area: string,
  id: string,
): Promise<ActionResult> {
  try {
    const menuArea = assertArea(area);
    const supabase = await getSupabase();
    const { error } = await supabase.from("opening_days").delete().eq("id", id);
    if (error) throw error;

    revalidate(menuArea);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
