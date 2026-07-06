"use client";

import { useState, useTransition } from "react";
import {
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
} from "@tabler/icons-react";
import type { MenuArea } from "@/lib/menuAreas";
import type { OpeningDay } from "@/lib/openingHours";
import {
  createOpeningDay,
  updateOpeningDay,
  deleteOpeningDay,
  type ActionResult,
  type OpeningInput,
} from "@/app/admin/opening-actions";

/** "2026-07-05" → "Sonntag, 5. Juli" (leer bei ungültigem/leerem Datum). */
function weekdayLabel(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${iso}T12:00:00`));
}

const EMPTY: OpeningInput = {
  date: "",
  openTime: "11:00",
  closeTime: "22:00",
  note: "",
  isEvent: false,
  eventTitle: "",
};

export function OpeningHoursAdmin({
  days,
  area,
}: {
  days: OpeningDay[];
  area: MenuArea;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<OpeningInput>(EMPTY);

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    setError("");
    startTransition(async () => {
      const r = await action();
      if (r.ok) onOk?.();
      else setError(r.error);
    });
  }

  return (
    <div className="admin">
      <p className="admin-intro">
        Trag hier die konkreten Öffnungstage ein — Datum und Uhrzeit von/bis. Die
        Biergarten-Seite zeigt daraus automatisch „Heute geöffnet/geschlossen". Vergangene
        Tage blendet sie selbst aus. Markiere einen Tag als „Besonderes Event" (z. B.
        Live-Musik), damit er auf der Startseite zusätzlich hervorgehoben wird.
      </p>

      {error && <p className="admin-error">{error}</p>}

      <form
        className="admin-openingday admin-openingday--new"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => createOpeningDay(area, draft),
            () => setDraft(EMPTY),
          );
        }}
      >
        <div className="field">
          <label>Datum</label>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Von</label>
          <input
            type="time"
            value={draft.openTime}
            onChange={(e) => setDraft({ ...draft, openTime: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Bis</label>
          <input
            type="time"
            value={draft.closeTime}
            onChange={(e) => setDraft({ ...draft, closeTime: e.target.value })}
            required
          />
        </div>
        <div className="field admin-openingday-note">
          <label>Hinweis (optional)</label>
          <input
            type="text"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="z. B. Feiertag"
          />
        </div>
        <div className="field admin-openingday-event">
          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              checked={draft.isEvent}
              onChange={(e) => setDraft({ ...draft, isEvent: e.target.checked })}
            />
            Besonderes Event
          </label>
          {draft.isEvent && (
            <input
              type="text"
              value={draft.eventTitle}
              onChange={(e) => setDraft({ ...draft, eventTitle: e.target.value })}
              placeholder="z. B. Metallica live"
              required
            />
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          <IconPlus size={18} stroke={1.75} aria-hidden />
          Tag hinzufügen
        </button>
      </form>

      {days.length === 0 ? (
        <p className="admin-empty">Noch keine Öffnungstage hinterlegt.</p>
      ) : (
        days.map((day) => <DayRow key={day.id} day={day} area={area} />)
      )}
    </div>
  );
}

function DayRow({ day, area }: { day: OpeningDay; area: MenuArea }) {
  const live: OpeningInput = {
    date: day.date,
    openTime: day.openTime,
    closeTime: day.closeTime,
    note: day.note ?? "",
    isEvent: day.isEvent,
    eventTitle: day.eventTitle ?? "",
  };
  const [form, setForm] = useState<OpeningInput>(live);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const dirty =
    form.date !== live.date ||
    form.openTime !== live.openTime ||
    form.closeTime !== live.closeTime ||
    form.note.trim() !== live.note.trim() ||
    form.isEvent !== live.isEvent ||
    form.eventTitle.trim() !== live.eventTitle.trim();

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updateOpeningDay(area, day.id, form);
      if (!r.ok) setError(r.error);
    });
  }

  function remove() {
    if (!window.confirm(`Öffnungstag „${weekdayLabel(day.date)}" löschen?`)) return;
    setError("");
    startTransition(async () => {
      const r = await deleteOpeningDay(area, day.id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="admin-openingday">
      <div className="field">
        <label>Datum</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <span className="admin-openingday-weekday">{weekdayLabel(form.date)}</span>
      </div>
      <div className="field">
        <label>Von</label>
        <input
          type="time"
          value={form.openTime}
          onChange={(e) => setForm({ ...form, openTime: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Bis</label>
        <input
          type="time"
          value={form.closeTime}
          onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
        />
      </div>
      <div className="field admin-openingday-note">
        <label>Hinweis</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="z. B. Feiertag"
        />
      </div>
      <div className="field admin-openingday-event">
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={form.isEvent}
            onChange={(e) => setForm({ ...form, isEvent: e.target.checked })}
          />
          Besonderes Event
        </label>
        {form.isEvent && (
          <input
            type="text"
            value={form.eventTitle}
            onChange={(e) => setForm({ ...form, eventTitle: e.target.value })}
            placeholder="z. B. Metallica live"
            required
          />
        )}
      </div>
      <div className="admin-actions">
        <button
          type="button"
          className={`btn admin-save ${dirty ? "admin-save--dirty" : "admin-save--clean"}`}
          disabled={pending || !dirty}
          onClick={save}
        >
          {dirty ? (
            <IconDeviceFloppy size={18} stroke={1.75} aria-hidden />
          ) : (
            <IconCheck size={18} stroke={1.75} aria-hidden />
          )}
          {pending ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}
        </button>
        <button
          type="button"
          className="admin-icon-btn admin-icon-btn--danger"
          title="Öffnungstag löschen"
          disabled={pending}
          onClick={remove}
        >
          <IconTrash size={18} stroke={1.75} aria-hidden />
        </button>
      </div>
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
