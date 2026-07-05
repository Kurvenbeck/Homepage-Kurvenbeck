"use client";

import { useState, useTransition } from "react";
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import { updateBacktag, type BacktagInput } from "@/app/admin/order-actions";

/**
 * Pflegt den aktiven Backtag (ein global aktiver Backtag). Solange „aktiv"
 * eingeschaltet ist und ein Datum gesetzt ist, kann auf der Backstube-Seite
 * vorbestellt werden. Save-Status grün/rot wie im übrigen Admin.
 */
export function BacktagAdmin({ initial }: { initial: BacktagInput }) {
  const [form, setForm] = useState<BacktagInput>(initial);
  const [saved, setSaved] = useState<BacktagInput>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const dirty =
    form.active !== saved.active ||
    form.date.trim() !== saved.date.trim() ||
    form.deadlineText.trim() !== saved.deadlineText.trim() ||
    form.pickupText.trim() !== saved.pickupText.trim();

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updateBacktag(form);
      if (r.ok) setSaved(form);
      else setError(r.error);
    });
  }

  return (
    <div className="admin admin-settings admin-backtag">
      {error && <p className="admin-error">{error}</p>}

      <label className="admin-toggle">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <span>
          Vorbestellungen aktiv{" "}
          <span className={`admin-toggle-state${form.active ? " is-on" : ""}`}>
            {form.active ? "an" : "aus"}
          </span>
        </span>
      </label>
      <p className="admin-hint">
        Ist der Schalter aus (oder kein Datum gesetzt), zeigt die Backstube-Seite
        „Aktuell kein Backtag" und niemand kann bestellen.
      </p>

      <div className="field">
        <label htmlFor="backtag-date">Backtag-Datum</label>
        <input
          id="backtag-date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <p className="admin-hint">Der Tag, für den vorbestellt und abgeholt wird.</p>
      </div>

      <div className="field">
        <label htmlFor="backtag-deadline">Bestellschluss (Text)</label>
        <input
          id="backtag-deadline"
          value={form.deadlineText}
          onChange={(e) => setForm({ ...form, deadlineText: e.target.value })}
          placeholder="Freitag 18 Uhr"
        />
        <p className="admin-hint">Wird den Gästen angezeigt, z. B. „Freitag 18 Uhr".</p>
      </div>

      <div className="field">
        <label htmlFor="backtag-pickup">Abholung (Text)</label>
        <input
          id="backtag-pickup"
          value={form.pickupText}
          onChange={(e) => setForm({ ...form, pickupText: e.target.value })}
          placeholder="Samstag ab 8 Uhr"
        />
        <p className="admin-hint">Wann abgeholt wird, z. B. „Samstag ab 8 Uhr".</p>
      </div>

      <button
        type="button"
        className={`btn admin-save ${dirty ? "admin-save--dirty" : "admin-save--clean"}`}
        disabled={pending || !dirty}
        onClick={save}
        title={
          dirty ? "Änderung noch nicht gespeichert" : "Deckungsgleich mit dem gespeicherten Stand"
        }
      >
        {dirty ? (
          <IconDeviceFloppy size={18} stroke={1.75} aria-hidden />
        ) : (
          <IconCheck size={18} stroke={1.75} aria-hidden />
        )}
        {pending ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}
      </button>
    </div>
  );
}
