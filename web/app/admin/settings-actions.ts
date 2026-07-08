"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { SETTINGS_KEYS } from "@/lib/siteSettings";

/**
 * Schreib-Aktion für die Kontaktdaten (site_settings). Wie beim Menü: läuft mit der
 * eingeloggten Sitzung, Autorisierung erzwingt RLS (`is_admin()`), kein service_role.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

export type SettingsInput = {
  phoneDisplay: string;
  phoneE164: string;
  email: string;
  address: string;
};

const E164_RE = /^\+\d{6,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  return supabase;
}

export async function updateSiteSettings(
  input: SettingsInput,
): Promise<ActionResult> {
  try {
    const supabase = await getSupabase();

    const phoneDisplay = input.phoneDisplay.trim();
    if (!phoneDisplay)
      return { ok: false, error: "Bitte eine Telefonnummer angeben." };

    const phoneE164 = input.phoneE164.trim().replace(/\s/g, "");
    if (!E164_RE.test(phoneE164))
      return {
        ok: false,
        error:
          "Bitte die internationale Nummer im Format +49… angeben (z. B. +4970711234560).",
      };

    const email = input.email.trim();
    if (!EMAIL_RE.test(email))
      return {
        ok: false,
        error: "Bitte eine gültige E-Mail-Adresse angeben (z. B. kontakt@kurvenbeck.com).",
      };

    const address = input.address.trim();

    const now = new Date().toISOString();
    const { error } = await supabase.from("site_settings").upsert(
      [
        { key: SETTINGS_KEYS.phoneDisplay, value: phoneDisplay, updated_at: now },
        { key: SETTINGS_KEYS.phoneE164, value: phoneE164, updated_at: now },
        { key: SETTINGS_KEYS.email, value: email, updated_at: now },
        { key: SETTINGS_KEYS.address, value: address, updated_at: now },
      ],
      { onConflict: "key" },
    );
    if (error) throw error;

    // Kontaktdaten stehen im Footer (alle Seiten) + CTAs → breit revalidieren.
    revalidatePath("/", "layout");
    revalidatePath("/admin/einstellungen");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unbekannter Fehler.",
    };
  }
}
