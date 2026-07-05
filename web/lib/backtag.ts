/**
 * „Backtag" der Backstube — client-sicher (kein Server-Import!), damit die
 * Bestell-Client-Komponente Typen/Helfer mitnutzen kann.
 *
 * Modell: EIN global aktiver Backtag (Entscheidung 2026-07-05). Der Betreiber
 * pflegt ihn im Admin; alle Vorbestellungen laufen auf den aktiven Backtag.
 * Gespeichert als `site_settings`-Werte (keine eigene Tabelle) — Loader in
 * `lib/getBacktag.ts` (Server).
 */

export type Backtag = {
  /** Nimmt die Backstube gerade Vorbestellungen an? */
  active: boolean;
  /** ISO-Datum des Backtags (yyyy-mm-dd) oder null. */
  date: string | null;
  /** Menschlich formatiert, z. B. „Samstag, 12. Juli". */
  dateLabel: string | null;
  /** Bestellschluss-Text, z. B. „Freitag 18 Uhr". */
  deadlineText: string;
  /** Abhol-Text, z. B. „Samstag ab 8 Uhr". */
  pickupText: string;
};

/** DB-Schlüssel (Single Source, geteilt mit Loader + Admin-Action). */
export const BACKTAG_KEYS = {
  active: "backtag_active",
  date: "backtag_date",
  deadlineText: "backtag_deadline_text",
  pickupText: "backtag_pickup_text",
} as const;

export const FALLBACK_BACKTAG_RAW = {
  active: "false",
  date: "",
  deadlineText: "Freitag 18 Uhr",
  pickupText: "Samstag ab 8 Uhr",
} as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Formatiert ein ISO-Datum als „Samstag, 12. Juli" (Europe/Berlin, de-DE). */
export function formatBacktagDate(iso: string): string {
  // Mittags-UTC vermeidet Zeitzonen-Verschiebung über die Datumsgrenze.
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  }).format(d);
}

/** Baut den `Backtag` aus den rohen `site_settings`-Werten. */
export function buildBacktag(raw: {
  active: string;
  date: string;
  deadlineText: string;
  pickupText: string;
}): Backtag {
  const date = DATE_RE.test(raw.date.trim()) ? raw.date.trim() : null;
  return {
    // Aktiv nur, wenn eingeschaltet UND ein gültiges Datum gesetzt ist.
    active: raw.active.trim() === "true" && date !== null,
    date,
    dateLabel: date ? formatBacktagDate(date) : null,
    deadlineText: raw.deadlineText.trim() || FALLBACK_BACKTAG_RAW.deadlineText,
    pickupText: raw.pickupText.trim() || FALLBACK_BACKTAG_RAW.pickupText,
  };
}
