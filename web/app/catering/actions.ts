"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Server Action für das Catering-Anfrageformular. Öffentlich aufrufbar (kein Login):
 * schreibt die Anfrage über RLS (`catering_requests_public_insert`) in Supabase.
 * Serverseitige Validierung zusätzlich zur Client-Validierung; einfacher Honeypot
 * gegen Bots. E-Mail-Benachrichtigung folgt separat (SMTP-Zugangsdaten offen).
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

    // TODO (blockiert bis SMTP-Zugangsdaten da): Benachrichtigung an
    // kontakt@kurvenbeck.com + optional Empfangsbestätigung an den Absender.

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
