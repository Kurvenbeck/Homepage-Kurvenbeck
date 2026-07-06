import {
  type OpeningStatus,
  formatGermanDate,
  formatShortDate,
  formatTime,
  formatRange,
} from "@/lib/openingHours";

/**
 * Zeigt den Öffnungs-Status eines Bereichs (Besenwirtschaft-Modell).
 * - `full`:    ausführliche Darstellung mit Datum + Uhrzeit (Bereichsseite).
 * - `compact`: kompakte Pille „Heute geöffnet · 11–22 Uhr" für Übersichten (Startseite-Kachel).
 * - `hero`:    große Pille + Vorschau der nächsten Öffnungstage, für den Hero-Bereich.
 * Der grüne Punkt bedeutet „jetzt geöffnet"; sonst neutral.
 */
export function OpeningStatusView({
  status,
  variant = "full",
}: {
  status: OpeningStatus;
  variant?: "full" | "compact" | "hero";
}) {
  const { today, openNow, opensLaterToday, next, upcoming } = status;

  const headline = today
    ? opensLaterToday
      ? `Heute ab ${formatTime(today.openTime)} Uhr geöffnet`
      : "Heute geöffnet"
    : "Heute geschlossen";

  if (variant === "hero") {
    const detail = today
      ? formatRange(today.openTime, today.closeTime)
      : next
        ? `nächster Tag: ${formatGermanDate(next.date)}`
        : null;
    return (
      <div className="hero-status">
        <span className={`open-pill open-pill--hero${openNow ? " is-open" : ""}`}>
          <span className={`open-dot${openNow ? " is-open" : ""}`} aria-hidden />
          <span className="open-pill-text">
            {headline}
            {detail && <span className="open-pill-detail"> · {detail}</span>}
          </span>
        </span>
        {upcoming.length > 0 && (
          <p className="hero-status-upcoming">
            Weitere Öffnungstage: {upcoming.map((d) => formatShortDate(d.date)).join(" · ")}
          </p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    const detail = today
      ? formatRange(today.openTime, today.closeTime)
      : next
        ? `nächster Tag: ${formatGermanDate(next.date)}`
        : null;
    return (
      <span
        className={`open-pill${openNow ? " is-open" : ""}`}
        title={
          today
            ? `${formatGermanDate(today.date)} · ${formatRange(today.openTime, today.closeTime)}`
            : undefined
        }
      >
        <span className={`open-dot${openNow ? " is-open" : ""}`} aria-hidden />
        <span className="open-pill-text">
          {headline}
          {detail && <span className="open-pill-detail"> · {detail}</span>}
        </span>
      </span>
    );
  }

  return (
    <div className="opening-hours" style={{ marginTop: "var(--space-8)" }}>
      <p className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
        Öffnungszeiten
      </p>
      <p
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        <span className={`open-dot${openNow ? " is-open" : ""}`} aria-hidden />
        {headline}
      </p>
      <p
        style={{
          fontSize: "var(--text-lg)",
          marginTop: "var(--space-1)",
          color: "var(--color-text-secondary)",
        }}
      >
        {today
          ? `${formatGermanDate(today.date)} · ${formatRange(today.openTime, today.closeTime)}`
          : next
            ? `Nächster Öffnungstag: ${formatGermanDate(next.date)} · ${formatRange(next.openTime, next.closeTime)}`
            : "Die nächsten Öffnungstage geben wir in Kürze bekannt."}
      </p>
    </div>
  );
}
