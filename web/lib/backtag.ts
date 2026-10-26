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
  /** Bestellschluss als Berliner Ortszeit „yyyy-MM-ddTHH:mm" oder null. */
  deadlineAt: string | null;
  /** Bestellschluss überschritten? (Dann ist `active` automatisch false.) */
  expired: boolean;
  /** Abhol-Text, z. B. „Samstag ab 8 Uhr". */
  pickupText: string;
};

/** DB-Schlüssel (Single Source, geteilt mit Loader + Admin-Action). */
export const BACKTAG_KEYS = {
  active: "backtag_active",
  date: "backtag_date",
  deadlineText: "backtag_deadline_text",
  deadlineAt: "backtag_deadline_at",
  pickupText: "backtag_pickup_text",
} as const;

export const FALLBACK_BACKTAG_RAW = {
  active: "false",
  date: "",
  deadlineText: "Freitag 18 Uhr",
  deadlineAt: "",
  pickupText: "Samstag ab 8 Uhr",
} as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const DEADLINE_AT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Aktuelle Berliner Ortszeit als „yyyy-MM-ddTHH:mm" (lexikografisch vergleichbar). */
export function nowBerlin(now: Date = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/**
 * Ist die Bestellfrist vorbei? Mit gesetztem Bestellschluss gilt dieser; ohne
 * schließt die Bestellung spätestens zu Beginn des Backtags.
 */
export function isBacktagExpired(
  date: string | null,
  deadlineAt: string | null,
  now: Date = new Date(),
): boolean {
  const cutoff = deadlineAt ?? (date ? `${date}T00:00` : null);
  if (!cutoff) return false;
  return nowBerlin(now) >= cutoff;
}

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
  deadlineAt: string;
  pickupText: string;
}): Backtag {
  const date = DATE_RE.test(raw.date.trim()) ? raw.date.trim() : null;
  const deadlineAt = DEADLINE_AT_RE.test(raw.deadlineAt.trim())
    ? raw.deadlineAt.trim()
    : null;
  const enabled = raw.active.trim() === "true" && date !== null;
  const expired = enabled && isBacktagExpired(date, deadlineAt);
  return {
    // Aktiv nur, wenn eingeschaltet, Datum gesetzt UND Bestellfrist nicht vorbei.
    active: enabled && !expired,
    expired,
    deadlineAt,
    date,
    dateLabel: date ? formatBacktagDate(date) : null,
    deadlineText: raw.deadlineText.trim() || FALLBACK_BACKTAG_RAW.deadlineText,
    pickupText: raw.pickupText.trim() || FALLBACK_BACKTAG_RAW.pickupText,
  };
}
