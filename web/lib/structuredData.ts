import type { SiteContact } from "./siteSettings";
import type { OpeningStatus } from "./openingHours";

/**
 * JSON-LD (schema.org) für Google & Co. — Typ bewusst `FoodEstablishment`,
 * NICHT `Bakery` (Titelschutz, siehe CLAUDE.md). Adresse/Telefon aus
 * `site_settings`, Öffnungszeiten aus `opening_days` (Besenwirtschaft-Modell:
 * konkrete Termine statt wiederkehrender Wochentage).
 */

const SITE_URL = "https://kurvenbeck.com";

/** "Mühlweg 12" / "72074 Musterstadt" → { straße, plz, ort }. */
function parseAddress(lines: string[]) {
  const [street, cityLine] = lines;
  const match = cityLine?.match(/^(\d{4,5})\s+(.+)$/);
  return {
    streetAddress: street,
    postalCode: match?.[1],
    addressLocality: match ? match[2] : cityLine,
  };
}

export function buildFoodEstablishmentJsonLd(
  contact: SiteContact,
  opening: OpeningStatus,
) {
  const { streetAddress, postalCode, addressLocality } = parseAddress(
    contact.addressLines,
  );

  const openingDays = [opening.today, ...opening.upcoming].filter(
    (d): d is NonNullable<typeof d> => d !== null,
  );

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: "Kurvenbeck",
    url: SITE_URL,
    telephone: contact.phoneE164,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      postalCode,
      addressLocality,
      addressCountry: "DE",
    },
    ...(openingDays.length > 0 && {
      openingHoursSpecification: openingDays.map((d) => ({
        "@type": "OpeningHoursSpecification",
        opens: d.openTime,
        closes: d.closeTime,
        validFrom: d.date,
        validThrough: d.date,
      })),
    }),
  };
}
