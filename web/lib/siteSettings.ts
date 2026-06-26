/**
 * Zentrale Seiten-Einstellungen — eine einzige Quelle, kein Hardcoden in
 * Komponenten.
 *
 * TODO: Werte aus der `site_settings`-Tabelle lesen (z. B. key `contact_phone`),
 * sobald Backend/CMS angebunden ist. Bis dahin statischer Platzhalter.
 * Dann diese Datei zu einem async Loader umbauen (oder Werte via Layout/
 * Server-Component aus der DB injizieren) — die `telHref`/`whatsappHref`-Helfer
 * bleiben gleich.
 */
export const siteSettings = {
  /** key: contact_phone */
  contactPhone: {
    display: "07071 / 12 34 56",
    /** E.164 für tel:-Links */
    e164: "+4970711234560",
  },
} as const;

/** Nur Ziffern (für wa.me): "4970711234560" */
const phoneDigits = siteSettings.contactPhone.e164.replace(/\D/g, "");

export const telHref = `tel:${siteSettings.contactPhone.e164}`;
export const whatsappHref = `https://wa.me/${phoneDigits}`;
