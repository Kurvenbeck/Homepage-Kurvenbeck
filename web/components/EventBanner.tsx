import { IconCalendarEvent } from "@tabler/icons-react";
import type { OpeningDay } from "@/lib/openingHours";
import { formatGermanDate, formatRange } from "@/lib/openingHours";

/**
 * Hebt anstehende Events (z. B. Live-Musik) sichtbar von den normalen
 * Öffnungstagen ab — unabhängig davon, wie weit sie in der Zukunft liegen.
 * Zeigt je Event eine eigene Pille, maximal 2 (weitere Events bleiben ungezeigt).
 */
export function EventBanner({ events }: { events: OpeningDay[] }) {
  if (events.length === 0) return null;

  return (
    <div className="event-banner-list">
      {events.slice(0, 2).map((event) => (
        <div className="event-banner" key={event.id}>
          <IconCalendarEvent size={20} stroke={1.75} aria-hidden />
          <span className="event-banner-text">
            <strong>{event.eventTitle}</strong>
            {" · "}
            {formatGermanDate(event.date)} · {formatRange(event.openTime, event.closeTime)}
          </span>
        </div>
      ))}
    </div>
  );
}
