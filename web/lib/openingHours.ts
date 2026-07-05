import { createClient } from "@/utils/supabase/server";

/**
 * Öffnungszeiten-Loader (Besenwirtschaft-Modell): konkrete Öffnungstage mit Datum +
 * Uhrzeit, gepflegt im Admin. Liest öffentlich über Publishable-Key + RLS.
 * „Heute" wird konsequent in der Zeitzone Europe/Berlin bestimmt, unabhängig von der
 * Server-Zeitzone.
 */

const TZ = "Europe/Berlin";

export type OpeningDay = {
  id: string;
  /** ISO-Datum YYYY-MM-DD. */
  date: string;
  /** "HH:MM". */
  openTime: string;
  /** "HH:MM". */
  closeTime: string;
  note: string | null;
};

export type OpeningStatus = {
  /** Öffnungstag mit heutigem Datum (oder null). */
  today: OpeningDay | null;
  /** Ist der Betrieb gerade (jetzt) geöffnet? */
  openNow: boolean;
  /** Öffnet heute erst später? (heute Öffnungstag, aber Startzeit noch nicht erreicht) */
  opensLaterToday: boolean;
  /** Nächster künftiger Öffnungstag (nach heute), falls vorhanden. */
  next: OpeningDay | null;
};

type Row = {
  id: string;
  date: string;
  open_time: string;
  close_time: string;
  note: string | null;
};

/** Datum/Uhrzeit „jetzt" in Europe/Berlin als Bausteine. */
function berlinNow(): { date: string; minutes: number } {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
  const hm = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now); // HH:MM
  const [h, m] = hm.split(":").map(Number);
  return { date, minutes: h * 60 + m };
}

/** "11:00:00" | "11:00" → Minuten seit Mitternacht. */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function mapRow(r: Row): OpeningDay {
  return {
    id: r.id,
    date: r.date,
    openTime: r.open_time.slice(0, 5),
    closeTime: r.close_time.slice(0, 5),
    note: r.note,
  };
}

/** Öffnungs-Status eines Bereichs für die öffentliche Seite. */
export async function getOpeningStatus(area: string): Promise<OpeningStatus> {
  const supabase = await createClient();
  const { date: todayIso, minutes: nowMin } = berlinNow();

  // Alle Tage ab heute (aufsteigend). Vergangene Tage sind irrelevant.
  const { data, error } = await supabase
    .from("opening_days")
    .select("id, date, open_time, close_time, note")
    .eq("area", area)
    .gte("date", todayIso)
    .order("date")
    .order("open_time")
    .returns<Row[]>();
  if (error) throw error;

  const days = (data ?? []).map(mapRow);

  const today =
    days.find((d) => d.date === todayIso && toMinutes(d.closeTime) > nowMin) ??
    null;
  const openNow =
    today !== null &&
    toMinutes(today.openTime) <= nowMin &&
    nowMin < toMinutes(today.closeTime);
  const opensLaterToday =
    today !== null && nowMin < toMinutes(today.openTime);

  // Nächster Tag: frühester Eintrag mit Datum *nach* heute (ein bereits
  // geschlossener Heute-Eintrag soll nicht als „nächster Öffnungstag" erscheinen).
  const next = days.find((d) => d.date > todayIso) ?? null;

  return { today, openNow, opensLaterToday, next };
}

/** Alle künftigen Öffnungstage (ab heute) für die Admin-Verwaltung. */
export async function getOpeningDaysForAdmin(area: string): Promise<OpeningDay[]> {
  const supabase = await createClient();
  const { date: todayIso } = berlinNow();

  const { data, error } = await supabase
    .from("opening_days")
    .select("id, date, open_time, close_time, note")
    .eq("area", area)
    .gte("date", todayIso)
    .order("date")
    .order("open_time")
    .returns<Row[]>();
  if (error) throw error;

  return (data ?? []).map(mapRow);
}

// --- Formatierung (de-DE) ----------------------------------------------------

/** "2026-07-05" → "Sonntag, 5. Juli". */
export function formatGermanDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(d);
}

/** "11:00" → "11", "11:30" → "11:30" (volle Stunden ohne ":00"). */
export function formatTime(hm: string): string {
  return hm.endsWith(":00") ? hm.slice(0, 2) : hm;
}

/** "11:00"/"22:00" → "11–22 Uhr". */
export function formatRange(open: string, close: string): string {
  return `${formatTime(open)}–${formatTime(close)} Uhr`;
}
