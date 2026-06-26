import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "AGB",
  robots: { index: false },
};

export default function AgbPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="AGB">
      <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
        Die Allgemeinen Geschäftsbedingungen für Catering-Aufträge und
        Backstube-Vorbestellungen sind in Vorbereitung und werden vor dem
        Live-Gang an dieser Stelle veröffentlicht.
      </p>
    </LegalPage>
  );
}
