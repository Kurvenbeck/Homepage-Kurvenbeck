/**
 * Zentrale Kontakt-/Seiten-Einstellungen — client-sicher (kein Server-Import!),
 * damit auch Client-Komponenten (z. B. der Footer auf der Login-Seite) diese
 * Typen/Fallbacks nutzen können.
 *
 * Die echten Werte kommen aus der Supabase-Tabelle `site_settings` und werden
 * serverseitig über `lib/getSiteSettings.ts` geladen. Solange dort (noch) nichts
 * gepflegt ist, greift `FALLBACK_CONTACT` — so entsteht nie ein leerer
 * `tel:`/`wa.me`-Link.
 *
 * ⚠️ Die Fallback-Telefonnummer ist ein PLATZHALTER und darf nicht live gehen —
 * der Betreiber pflegt die echte Nummer im Admin unter „Einstellungen".
 */

export type SiteContact = {
  /** Anzeige-Telefonnummer, z. B. "07071 / 12 34 56". */
  phoneDisplay: string;
  /** E.164 für tel:-Links, z. B. "+4970711234560". */
  phoneE164: string;
  /** Kontakt-E-Mail, z. B. "kontakt@kurvenbeck.com". */
  email: string;
  /** Adresse zeilenweise (leere Zeilen entfernt). */
  addressLines: string[];
  telHref: string;
  whatsappHref: string;
  mailtoHref: string;
  /** Reiner Link zu Google Maps (kein iframe) — keine Drittanbieter-Anfrage vor dem Klick. */
  mapsHref: string;
};

/** DB-Schlüssel der Einstellungen (Single Source, geteilt mit Loader + Admin). */
export const SETTINGS_KEYS = {
  phoneDisplay: "contact_phone_display",
  phoneE164: "contact_phone_e164",
  email: "contact_email",
  address: "contact_address",
} as const;

/** Baut die abgeleiteten Links aus den rohen Werten. */
export function buildContact(input: {
  phoneDisplay: string;
  phoneE164: string;
  email: string;
  address: string;
}): SiteContact {
  const digits = input.phoneE164.replace(/\D/g, ""); // wa.me: ohne + und ohne führende Null
  const addressLines = input.address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    phoneDisplay: input.phoneDisplay,
    phoneE164: input.phoneE164,
    email: input.email,
    addressLines,
    telHref: `tel:${input.phoneE164}`,
    whatsappHref: `https://wa.me/${digits}`,
    mailtoHref: `mailto:${input.email}`,
    mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(", "))}`,
  };
}

/** Rohwerte-Platzhalter (deckungsgleich mit dem Seed der Migration). */
export const FALLBACK_SETTINGS = {
  phoneDisplay: "07071 / 12 34 56",
  phoneE164: "+4970711234560",
  email: "kontakt@kurvenbeck.com",
  address: "Mühlweg 12\n72074 Musterstadt",
} as const;

export const FALLBACK_CONTACT: SiteContact = buildContact(FALLBACK_SETTINGS);
