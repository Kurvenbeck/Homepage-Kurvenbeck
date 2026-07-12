import { getSiteSettings } from "@/lib/getSiteSettings";
import { SiteFooter } from "./SiteFooter";

/**
 * Einzige Stelle, die Seiten zum Einbinden des Footers nutzen sollen (siehe
 * CLAUDE.md „Kontaktdaten & Konfiguration"). Zieht die Kontaktdaten immer
 * live aus `site_settings` — verhindert, dass eine Seite `<SiteFooter />`
 * ohne `contact`-Prop einbindet und dadurch die Platzhalter-Kontaktdaten
 * anzeigt (passiert war das bei Impressum/Datenschutz/AGB, 2026-07-09).
 * Nur in Client-Komponenten (`"use client"`) nicht einsetzbar — dort bleibt
 * `<SiteFooter />` mit Fallback nötig.
 */
export async function SiteFooterServer() {
  const contact = await getSiteSettings();
  return <SiteFooter contact={contact} />;
}
