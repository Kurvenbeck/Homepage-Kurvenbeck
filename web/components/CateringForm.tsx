"use client";

import { useState, useTransition } from "react";
import { submitCateringRequest } from "@/app/catering/actions";

type Errors = Partial<Record<"name" | "mail" | "gaeste", string>>;

const ANLAESSE = [
  "Geburtstag",
  "Hochzeit",
  "Firmenfeier",
  "Vereinsfest",
  "Sonstiges",
];

/**
 * Catering-Anfrageformular. Client-Validierung für schnelles Feedback, echte
 * Übermittlung über die Server Action `submitCateringRequest` (speichert in
 * Supabase; Admin-Posteingang unter /admin/catering).
 */
export function CateringForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string)?.trim() ?? "";
    const mail = (data.get("mail") as string)?.trim() ?? "";
    const gaeste = (data.get("gaeste") as string)?.trim() ?? "";

    const next: Errors = {};
    if (!name) next.name = "Bitte gib deinen Namen an.";
    if (!mail) next.mail = "Bitte gib deine E-Mail an.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      next.mail = "Bitte eine gültige E-Mail-Adresse angeben.";
    if (gaeste && Number(gaeste) < 1)
      next.gaeste = "Bitte eine gültige Gästezahl angeben.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      const result = await submitCateringRequest({
        name,
        email: mail,
        occasion: (data.get("anlass") as string) ?? "",
        guests: gaeste,
        eventDate: (data.get("datum") as string) ?? "",
        message: (data.get("nachricht") as string) ?? "",
        company: (data.get("company") as string) ?? "",
      });
      if (result.ok) setSent(true);
      else setServerError(result.error);
    });
  }

  if (sent) {
    return (
      <div className="form-success" role="status">
        <h3>Vielen Dank für deine Anfrage!</h3>
        <p>
          Wir haben deine Nachricht erhalten und melden uns innerhalb von 48
          Stunden mit einem unverbindlichen Angebot bei dir.
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {/* Honeypot: für Menschen unsichtbar, fängt einfache Bots ab. */}
      <div className="hp-field" aria-hidden>
        <label htmlFor="company">Firma (bitte leer lassen)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Vor- und Nachname"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "err-name" : undefined}
          />
          {errors.name && (
            <span className="field-error" id="err-name">
              {errors.name}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="mail">E-Mail</label>
          <input
            id="mail"
            name="mail"
            type="email"
            placeholder="name@email.de"
            aria-invalid={errors.mail ? true : undefined}
            aria-describedby={errors.mail ? "err-mail" : undefined}
          />
          {errors.mail && (
            <span className="field-error" id="err-mail">
              {errors.mail}
            </span>
          )}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="anlass">Anlass</label>
          <select id="anlass" name="anlass" defaultValue={ANLAESSE[0]}>
            {ANLAESSE.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="gaeste">Gäste (ca.)</label>
          <input
            id="gaeste"
            name="gaeste"
            type="number"
            min={1}
            placeholder="z. B. 40"
            aria-invalid={errors.gaeste ? true : undefined}
            aria-describedby={errors.gaeste ? "err-gaeste" : undefined}
          />
          {errors.gaeste && (
            <span className="field-error" id="err-gaeste">
              {errors.gaeste}
            </span>
          )}
        </div>
      </div>
      <div className="field">
        <label htmlFor="datum">Wunschdatum</label>
        <input id="datum" name="datum" type="date" />
      </div>
      <div className="field">
        <label htmlFor="nachricht">Deine Nachricht</label>
        <textarea
          id="nachricht"
          name="nachricht"
          rows={3}
          placeholder="Worauf dürfen wir uns einstellen?"
        />
      </div>
      {serverError && (
        <p className="field-error" role="alert" style={{ marginBottom: "var(--space-3)" }}>
          {serverError}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={pending}
      >
        {pending ? "Wird gesendet …" : "Anfrage senden"}
      </button>
      <p className="form-note">
        Wir nutzen deine Angaben nur, um deine Anfrage zu beantworten.
      </p>
    </form>
  );
}
