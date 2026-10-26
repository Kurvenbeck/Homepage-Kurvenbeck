import { createClient } from "@/utils/supabase/server";
import {
  BACKTAG_KEYS,
  buildBacktag,
  FALLBACK_BACKTAG_RAW,
  type Backtag,
} from "./backtag";

/**
 * Server-Loader für den aktiven Backtag aus `site_settings` (öffentlich lesbar
 * via Publishable-Key + RLS). Fällt bei fehlenden Werten auf „kein Backtag".
 */
async function readRaw() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .returns<{ key: string; value: string }[]>();

  const map = new Map((data ?? []).map((r) => [r.key, r.value] as const));
  return {
    active: map.get(BACKTAG_KEYS.active) ?? FALLBACK_BACKTAG_RAW.active,
    date: map.get(BACKTAG_KEYS.date) ?? FALLBACK_BACKTAG_RAW.date,
    deadlineText:
      map.get(BACKTAG_KEYS.deadlineText) ?? FALLBACK_BACKTAG_RAW.deadlineText,
    deadlineAt:
      map.get(BACKTAG_KEYS.deadlineAt) ?? FALLBACK_BACKTAG_RAW.deadlineAt,
    pickupText:
      map.get(BACKTAG_KEYS.pickupText) ?? FALLBACK_BACKTAG_RAW.pickupText,
  };
}

/** Öffentlicher Backtag-Status für die Backstube-Seite. */
export async function getBacktag(): Promise<Backtag> {
  return buildBacktag(await readRaw());
}

export type BacktagRaw = {
  active: boolean;
  date: string;
  deadlineText: string;
  deadlineAt: string;
  pickupText: string;
};

/** Rohwerte fürs Admin-Formular. */
export async function getBacktagForAdmin(): Promise<BacktagRaw> {
  const raw = await readRaw();
  return {
    active: raw.active.trim() === "true",
    date: raw.date.trim(),
    deadlineText: raw.deadlineText,
    deadlineAt: raw.deadlineAt.trim(),
    pickupText: raw.pickupText,
  };
}
