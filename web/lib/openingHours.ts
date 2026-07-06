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
  /** Besonderes Event (z. B. Live-Musik) statt normaler Öffnungstag. */
  isEvent: boolean;
  /** Titel des Events, z. B. "Metallica live" (nur bei isEvent). */
  eventTitle: string | null;
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
  /** Bis zu 3 künftige Öffnungstage nach heute (für die Hero-Vorschau). */
  upcoming: OpeningDay[];
  /** Bis zu 2 anstehende Events (heute oder künftig), älteste zuerst. */
  events: OpeningDay[];
};

type Row = {
  id: string;
  date: string;
  open_time: string;
  close_time: string;
  note: string | null;
  is_event: boolean;
  event_title: string | null;
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
    isEvent: r.is_event,
    eventTitle: r.event_title,
  };
}

/** Öffnungs-Status eines Bereichs für die öffentliche Seite. */
export async function getOpeningStatus(area: string): Promise<OpeningStatus> {
  const supabase = await createClient();
  const { date: todayIso, minutes: nowMin } = berlinNow();

  // Alle Tage ab heute (aufsteigend). Vergangene Tage sind irrelevant.
  const { data, error } = await supabase
    .from("opening_days")
    .select("id, date, open_time, close_time, note, is_event, event_title")
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

  // Die nächsten künftigen Öffnungstage (ohne heute) für die Hero-Vorschau —
  // rutscht Tag für Tag nach, sobald ein Tag in der Vergangenheit liegt.
  const upcoming = days.filter((d) => d.date > todayIso).slice(0, 3);

  // Events: bis zu 2, können heute oder ein beliebiger künftiger Tag sein, auch
  // außerhalb der `upcoming`-Vorschau (z. B. ein Konzert erst in Wochen).
  const events = days.filter((d) => d.isEvent).slice(0, 2);

  return { today, openNow, opensLaterToday, next, upcoming, events };
}

/** Alle künftigen Öffnungstage (ab heute) für die Admin-Verwaltung. */
export async function getOpeningDaysForAdmin(area: string): Promise<OpeningDay[]> {
  const supabase = await createClient();
  const { date: todayIso } = berlinNow();

  const { data, error } = await supabase
    .from("opening_days")
    .select("id, date, open_time, close_time, note, is_event, event_title")
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

/** "2026-07-11" → "Sa 11.7." (kurz, für Vorschau-Listen). */
export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const weekday = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    timeZone: TZ,
  }).format(d);
  const dayMonth = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "numeric",
    timeZone: TZ,
  }).format(d);
  return `${weekday} ${dayMonth}.`;
}
