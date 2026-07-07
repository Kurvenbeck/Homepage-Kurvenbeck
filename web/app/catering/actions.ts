"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { sendMailTo, sendNotificationMail } from "@/lib/mail";

/**
 * Server Action für das Catering-Anfrageformular. Öffentlich aufrufbar (kein Login):
 * schreibt die Anfrage über RLS (`catering_requests_public_insert`) in Supabase.
 * Serverseitige Validierung zusätzlich zur Client-Validierung; einfacher Honeypot
 * gegen Bots. Nach erfolgreichem Speichern geht eine Benachrichtigung an
 * kontakt@kurvenbeck.com (Hostinger-SMTP).
 */

export type CateringResult = { ok: true } | { ok: false; error: string };

export type CateringInput = {
  name: string;
  email: string;
  occasion: string;
  guests: string;
  eventDate: string;
  message: string;
  /** Honeypot: von Menschen leer, von Bots oft ausgefüllt. */
  company: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCateringMail(data: {
  name: string;
  email: string;
  occasion: string | null;
  guests: number | null;
  eventDate: string;
  message: string | null;
}) {
  const rows = [
    ["Name", data.name],
    ["E-Mail", data.email],
    ["Anlass", data.occasion ?? "–"],
    ["Gäste", data.guests ? String(data.guests) : "–"],
    ["Wunschdatum", data.eventDate || "–"],
  ];
  return `
    <div style="font-family: sans-serif; font-size: 15px; color: #222;">
      <h2 style="margin: 0 0 16px;">Neue Catering-Anfrage</h2>
      <table cellpadding="6" cellspacing="0">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#666;">${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      ${data.message ? `<p style="margin-top:16px; white-space: pre-wrap;">${escapeHtml(data.message)}</p>` : ""}
      <p style="margin-top:24px; color:#666; font-size:13px;">Die Anfrage findest du auch im Admin-Posteingang unter /admin/catering.</p>
    </div>
  `;
}

function renderCateringConfirmationMail(data: {
  name: string;
  occasion: string | null;
  guests: number | null;
  eventDate: string;
}) {
  const rows = [
    ["Anlass", data.occasion ?? "–"],
    ["Gäste", data.guests ? String(data.guests) : "–"],
    ["Wunschdatum", data.eventDate || "–"],
  ];
  return `
    <div style="font-family: sans-serif; font-size: 15px; color: #222;">
      <h2 style="margin: 0 0 16px;">Wir haben deine Anfrage erhalten</h2>
      <p>Hallo ${escapeHtml(data.name)},</p>
      <p>danke für deine Anfrage! Wir haben sie erhalten und melden uns zeitnah bei dir. Hier nochmal deine Angaben:</p>
      <table cellpadding="6" cellspacing="0">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#666;">${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:24px;">Bis bald,<br>dein Kurvenbeck-Team</p>
    </div>
  `;
}

export async function submitCateringRequest(
  input: CateringInput,
): Promise<CateringResult> {
  try {
    // Honeypot: ausgefüllt → als Spam verwerfen, aber „Erfolg" vortäuschen.
    if (input.company.trim() !== "") return { ok: true };

    const name = input.name.trim();
    const email = input.email.trim();
    if (!name) return { ok: false, error: "Bitte gib deinen Namen an." };
    if (!email || !EMAIL_RE.test(email))
      return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };

    let guests: number | null = null;
    const guestsRaw = input.guests.trim();
    if (guestsRaw) {
      const n = Number(guestsRaw);
      if (!Number.isInteger(n) || n < 1)
        return { ok: false, error: "Bitte eine gültige Gästezahl angeben." };
      guests = n;
    }

    const eventDate = input.eventDate.trim();
    if (eventDate && (!DATE_RE.test(eventDate) || Number.isNaN(Date.parse(eventDate))))
      return { ok: false, error: "Bitte ein gültiges Wunschdatum wählen." };

    // Begrenzen, damit übergroße Eingaben nicht durchrutschen.
    const occasion = input.occasion.trim().slice(0, 100) || null;
    const message = input.message.trim().slice(0, 5000) || null;

    const supabase = await createClient();
    const { error } = await supabase.from("catering_requests").insert({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      occasion,
      guests,
      event_date: eventDate || null,
      message,
    });
    if (error) throw error;

    // Admin-Posteingang sofort aktuell halten.
    revalidatePath("/admin/catering");

    await sendNotificationMail({
      subject: `Neue Catering-Anfrage von ${name}`,
      replyTo: email,
      html: renderCateringMail({ name, email, occasion, guests, eventDate, message }),
    });

    await sendMailTo({
      to: email,
      subject: "Deine Catering-Anfrage bei Kurvenbeck",
      html: renderCateringConfirmationMail({ name, occasion, guests, eventDate }),
    });

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? "Die Anfrage konnte nicht gespeichert werden. Bitte versuch es später erneut."
          : "Unbekannter Fehler.",
    };
  }
}
