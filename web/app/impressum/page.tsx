import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Impressum">
      <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
        Angaben gemäß § 5 DDG. Diese Seite ist ein Platzhalter — die
        vollständigen Angaben (Betreiber, Anschrift, Vertretungsberechtigte,
        Registereintrag, USt-IdNr., Verantwortlicher für den Inhalt) werden vor
        dem Live-Gang ergänzt.
      </p>
      <p style={{ marginTop: "var(--space-6)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
        Kurvenbeck Familienbetrieb
        <br />
        Mühlweg 12, 72074 Musterstadt
        <br />
        Telefon: 07071 / 12 34 56
        <br />
        E-Mail: hallo@kurvenbeck.de
      </p>
    </LegalPage>
  );
}
