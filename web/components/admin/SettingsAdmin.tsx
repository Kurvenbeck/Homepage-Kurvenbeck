"use client";

import { useState, useTransition } from "react";
import { IconDeviceFloppy, IconCheck } from "@tabler/icons-react";
import {
  updateSiteSettings,
  type SettingsInput,
} from "@/app/admin/settings-actions";

/**
 * Pflegt die Kontaktdaten (Telefon + Adresse) aus `site_settings`.
 * Save-Status grün/rot wie im Menü-Admin: grün = deckungsgleich mit dem
 * gespeicherten Stand, rot = ungespeicherte Änderung.
 */
export function SettingsAdmin({ initial }: { initial: SettingsInput }) {
  const [form, setForm] = useState<SettingsInput>(initial);
  const [saved, setSaved] = useState<SettingsInput>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const dirty =
    form.phoneDisplay.trim() !== saved.phoneDisplay.trim() ||
    form.phoneE164.trim() !== saved.phoneE164.trim() ||
    form.email.trim() !== saved.email.trim() ||
    form.address.trim() !== saved.address.trim();

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updateSiteSettings(form);
      if (r.ok) setSaved(form);
      else setError(r.error);
    });
  }

  return (
    <div className="admin admin-settings">
      {error && <p className="admin-error">{error}</p>}

      <div className="field">
        <label htmlFor="phoneDisplay">Telefon (Anzeige)</label>
        <input
          id="phoneDisplay"
          value={form.phoneDisplay}
          onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })}
          placeholder="07071 / 12 34 56"
        />
        <p className="admin-hint">So wird die Nummer auf der Seite angezeigt.</p>
      </div>

      <div className="field">
        <label htmlFor="phoneE164">Telefon (international, für Anruf-/WhatsApp-Links)</label>
        <input
          id="phoneE164"
          value={form.phoneE164}
          inputMode="tel"
          onChange={(e) => setForm({ ...form, phoneE164: e.target.value })}
          placeholder="+4970711234560"
        />
        <p className="admin-hint">
          Mit Ländervorwahl, ohne Leerzeichen — z. B. +49 für Deutschland statt der
          führenden 0. Wird für „Anrufen" und WhatsApp genutzt.
        </p>
      </div>

      <div className="field">
        <label htmlFor="email">E-Mail</label>
        <input
          id="email"
          type="email"
          value={form.email}
          inputMode="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="kontakt@kurvenbeck.com"
        />
        <p className="admin-hint">
          Wird im Footer als Kontakt-Adresse angezeigt und verlinkt.
        </p>
      </div>

      <div className="field">
        <label htmlFor="address">Adresse</label>
        <textarea
          id="address"
          value={form.address}
          rows={2}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder={"Mühlweg 12\n72074 Musterstadt"}
        />
        <p className="admin-hint">Eine Zeile pro Adresszeile (Straße, dann PLZ + Ort).</p>
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
