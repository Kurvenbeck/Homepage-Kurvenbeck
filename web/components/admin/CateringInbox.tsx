"use client";

import { useState, useTransition } from "react";
import { IconCheck, IconRotate, IconMail, IconCalendar, IconUsers } from "@tabler/icons-react";
import type { CateringRequest } from "@/lib/catering";
import { setCateringRequestStatus } from "@/app/admin/catering-actions";

/** Formatiert einen ISO-Zeitstempel als de-DE-Datum mit Uhrzeit (Europe/Berlin). */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

/** Formatiert ein reines Datum (YYYY-MM-DD) als de-DE. */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
}

function InboxItem({ request }: { request: CateringRequest }) {
  const [status, setStatus] = useState(request.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDone = status === "erledigt";
  const next = isDone ? "neu" : "erledigt";

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setCateringRequestStatus(request.id, next);
      if (result.ok) setStatus(next);
      else setError(result.error);
    });
  }

  return (
    <div className={`inbox-item${isDone ? " is-done" : ""}`}>
      <div className="inbox-head">
        <span className="inbox-name">{request.name}</span>
        <span className="inbox-date">{formatDateTime(request.createdAt)}</span>
      </div>
      <div className="inbox-meta">
        <a href={`mailto:${request.email}`}>
          <IconMail size={15} stroke={1.75} aria-hidden /> {request.email}
        </a>
        {request.occasion && <span>{request.occasion}</span>}
        {request.guests != null && (
          <span>
            <IconUsers size={15} stroke={1.75} aria-hidden /> {request.guests} Gäste
          </span>
        )}
        {request.eventDate && (
          <span>
            <IconCalendar size={15} stroke={1.75} aria-hidden /> {formatDate(request.eventDate)}
          </span>
        )}
      </div>
      {request.message && <p className="inbox-message">{request.message}</p>}
      <div className="inbox-actions">
        <span className={`inbox-status${isDone ? " is-done" : " is-new"}`}>
          {isDone ? "Erledigt" : "Neu"}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggle}
          disabled={pending}
        >
          {isDone ? (
            <>
              <IconRotate size={16} stroke={1.75} aria-hidden />
              Wieder als „neu"
            </>
          ) : (
            <>
              <IconCheck size={16} stroke={1.75} aria-hidden />
              Als erledigt markieren
            </>
          )}
        </button>
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export function CateringInbox({ requests }: { requests: CateringRequest[] }) {
  if (requests.length === 0) {
    return <p className="inbox-empty">Noch keine Anfragen eingegangen.</p>;
  }
  return (
    <div className="inbox-list">
      {requests.map((request) => (
        <InboxItem key={request.id} request={request} />
      ))}
    </div>
  );
}
