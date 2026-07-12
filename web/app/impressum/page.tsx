import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Impressum">
      <div className="legal-content">
        <p className="legal-meta">Angaben gemäß § 5 DDG</p>

        <h2>Anbieter</h2>
        <p>
          Kurvenbeck GmbH
          <br />
          Im Hetzenloch 3
          <br />
          89558 Böhmenkirch – Schnittlingen
        </p>

        <h2>Vertreten durch</h2>
        <p>Geschäftsführer: Johannes Wehner</p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:kontakt@kurvenbeck.com">kontakt@kurvenbeck.com</a>
        </p>

        <h2>Registereintrag</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Registergericht und Handelsregisternummer werden nachgetragen, sobald der
          Eintrag vorliegt.
        </p>

        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          DE455026608
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Johannes Wehner
          <br />
          Im Hetzenloch 3
          <br />
          89558 Böhmenkirch – Schnittlingen
        </p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
          (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse findest du oben.
        </p>
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>
    </LegalPage>
  );
}
