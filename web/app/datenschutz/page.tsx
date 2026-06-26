import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Datenschutz">
      <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
        Diese Datenschutzerklärung ist ein Platzhalter. Vor dem Live-Gang werden
        hier die Pflichtangaben nach DSGVO ergänzt — insbesondere zu
        verantwortlicher Stelle, Zweck und Rechtsgrundlage der Verarbeitung
        (u. a. Catering-Anfrageformular und Backstube-Vorbestellung),
        Speicherdauer, eingesetzten Diensten sowie deinen Betroffenenrechten.
      </p>
    </LegalPage>
  );
}
