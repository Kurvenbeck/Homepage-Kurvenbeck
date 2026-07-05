import { createClient } from "@/utils/supabase/server";
import {
  buildContact,
  FALLBACK_SETTINGS,
  SETTINGS_KEYS,
  type SiteContact,
} from "./siteSettings";

/**
 * Server-Loader für die Kontaktdaten aus `site_settings` (öffentlich lesbar via
 * Publishable-Key + RLS). Fällt bei fehlenden/leeren Werten auf die Platzhalter
 * zurück, damit nie ein leerer tel:/wa.me-Link entsteht.
 */
export async function getSiteSettings(): Promise<SiteContact> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .returns<{ key: string; value: string }[]>();

  if (error || !data) return buildContact(FALLBACK_SETTINGS);

  const map = new Map(data.map((row) => [row.key, row.value] as const));
  return buildContact({
    phoneDisplay:
      map.get(SETTINGS_KEYS.phoneDisplay)?.trim() || FALLBACK_SETTINGS.phoneDisplay,
    phoneE164:
      map.get(SETTINGS_KEYS.phoneE164)?.trim() || FALLBACK_SETTINGS.phoneE164,
    address: map.get(SETTINGS_KEYS.address) ?? FALLBACK_SETTINGS.address,
  });
}

export type SiteSettingsRaw = {
  phoneDisplay: string;
  phoneE164: string;
  address: string;
};

/** Rohwerte für das Admin-Formular (mit Fallback, falls noch nichts gepflegt). */
export async function getSiteSettingsForAdmin(): Promise<SiteSettingsRaw> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .returns<{ key: string; value: string }[]>();

  const map = new Map((data ?? []).map((row) => [row.key, row.value] as const));
  return {
    phoneDisplay:
      map.get(SETTINGS_KEYS.phoneDisplay) ?? FALLBACK_SETTINGS.phoneDisplay,
    phoneE164: map.get(SETTINGS_KEYS.phoneE164) ?? FALLBACK_SETTINGS.phoneE164,
    address: map.get(SETTINGS_KEYS.address) ?? FALLBACK_SETTINGS.address,
  };
}
