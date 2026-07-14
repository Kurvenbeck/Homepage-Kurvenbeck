import { IconMapPin } from "@tabler/icons-react";
import type { SiteContact } from "@/lib/siteSettings";

/**
 * Pille "Route planen" auf den Foto-Heroes (Startseite + Bereichsseiten).
 * Reiner Link zu Google Maps — keine eingebettete Karte, damit keine
 * Drittanbieter-Anfrage vor dem Klick entsteht (siehe CLAUDE.md, kein
 * Cookie-Banner nötig).
 */
export function RoutePill({ contact }: { contact: SiteContact }) {
  if (contact.addressLines.length === 0) return null;
  return (
    <a
      href={contact.mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      className="route-pill"
    >
      <IconMapPin size={16} stroke={1.75} aria-hidden />
      Route planen · {contact.addressLines.join(", ")}
    </a>
  );
}
