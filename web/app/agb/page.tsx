import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "AGB",
  robots: { index: false },
};

export default function AgbPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="AGB">
      <div className="legal-content">
        <p className="legal-meta">Stand: Juli 2026</p>

        <h2>Präambel</h2>
        <p>
          Die Kurvenbeck GmbH ist ein regionaler Anbieter von
          Cateringdienstleistungen sowie handwerklich hergestellten Backwaren.
          Diese AGB regeln die Geschäftsbeziehungen mit privaten und
          gewerblichen Kunden. Ziel ist eine transparente, faire und
          verständliche Grundlage für die Zusammenarbeit.
        </p>

        <h2>1. Anbieter</h2>
        <p>
          Kurvenbeck GmbH
          <br />
          Im Hetzenloch 3
          <br />
          89558 Böhmenkirch – Schnittlingen
          <br />
          E-Mail: <a href="mailto:kontakt@kurvenbeck.com">kontakt@kurvenbeck.com</a>
          <br />
          USt-IdNr.: DE455026608
        </p>

        <h2>2. Geltungsbereich</h2>
        <p>
          Diese AGB gelten für sämtliche Cateringleistungen sowie
          Vorbestellungen von Backwaren über die Website der Kurvenbeck GmbH.
          Individuelle Vereinbarungen im Angebot oder Auftragsbestätigung
          gehen diesen AGB vor.
        </p>

        <h2>3. Catering – Anfrage, Angebot und Vertragsschluss</h2>
        <p>
          Die Website dient ausschließlich der unverbindlichen Anfrage. Mit
          Absenden des Kontaktformulars entsteht kein Vertrag.
        </p>
        <p>
          Nach Eingang der Anfrage erfolgt eine persönliche Beratung per
          Telefon oder E-Mail. Auf dieser Grundlage erstellt die Kurvenbeck
          GmbH ein individuelles Angebot.
        </p>
        <p>
          Der Vertrag kommt erst zustande, wenn der Kunde das Angebot annimmt
          oder die Kurvenbeck GmbH den Auftrag schriftlich bestätigt.
        </p>

        <h2>4. Leistungsumfang</h2>
        <ul>
          <li>
            Lieferung innerhalb eines Umkreises von ca. 40 km; weitere
            Entfernungen nach Vereinbarung.
          </li>
          <li>
            Lieferung, Aufbau, Servicepersonal, Betreuung, Abbau und Abholung
            ausschließlich gemäß individuellem Angebot.
          </li>
          <li>
            Änderungen aufgrund saisonaler Verfügbarkeit oder
            Lieferengpässen bleiben vorbehalten, sofern Art und Qualität der
            Leistung gleichwertig bleiben.
          </li>
        </ul>

        <h2>5. Personenzahl</h2>
        <p>
          Änderungen der Personenzahl sind bis spätestens fünf Kalendertage
          vor der Veranstaltung möglich. Danach gilt grundsätzlich die
          zuletzt bestätigte Personenzahl als Berechnungsgrundlage.
        </p>

        <h2>6. Preise und Zahlung</h2>
        <p>
          Maßgeblich sind die im individuellen Angebot vereinbarten Preise.
          Die Zahlung erfolgt – je nach Vereinbarung – per Vorkasse,
          Anzahlung, Rechnung oder Barzahlung.
        </p>

        <h2>7. Stornierung</h2>
        <ul>
          <li>Bis 14 Tage vor Veranstaltungsbeginn: kostenfrei</li>
          <li>13 bis 7 Tage: 30 % des vereinbarten Auftragswertes</li>
          <li>6 bis 3 Tage: 60 %</li>
          <li>2 Tage vorher: 80 %</li>
          <li>Am Vortag oder Veranstaltungstag: 100 %</li>
        </ul>
        <p>
          Dem Kunden bleibt der Nachweis vorbehalten, dass der Kurvenbeck
          GmbH kein oder ein geringerer Schaden entstanden ist.
        </p>

        <h2>8. Leihgeschirr und Equipment</h2>
        <ul>
          <li>
            Rückgabe innerhalb von zwei Kalendertagen nach der Veranstaltung,
            sofern nichts anderes vereinbart wurde.
          </li>
          <li>Geschirr und Equipment sind gereinigt zurückzugeben.</li>
          <li>
            Beschädigte oder verlorene Gegenstände werden zum
            Wiederbeschaffungswert berechnet.
          </li>
        </ul>

        <h2>9. Backstube – Vorbestellung</h2>
        <p>
          Backwaren können ausschließlich innerhalb der auf der Website
          veröffentlichten Bestellfenster bestellt werden. Bestellschluss und
          Abholzeit werden jeweils auf der Website bekanntgegeben.
        </p>
        <p>
          Die Zahlung erfolgt bei Abholung. Eine Lieferung findet derzeit
          nicht statt.
        </p>
        <p>
          Nach Abschluss der Bestellung sind Änderungen online nicht mehr
          möglich. Änderungswünsche können telefonisch angefragt werden; ein
          Anspruch hierauf besteht nicht.
        </p>
        <p>
          Nicht abgeholte Ware wird nach Ablauf des Abholzeitfensters nicht
          weiter vorgehalten. Der Zahlungsanspruch bleibt bestehen, da die
          Ware individuell vorbereitet wurde.
        </p>

        <h2>10. Widerrufsrecht</h2>
        <p>
          Bei den angebotenen Backwaren handelt es sich überwiegend um
          schnell verderbliche Lebensmittel. Für diese besteht nach den
          gesetzlichen Vorschriften grundsätzlich kein Widerrufsrecht.
        </p>

        <h2>11. Allergene</h2>
        <p>
          Allergeninformationen werden für die angebotenen Produkte
          bereitgestellt. Trotz sorgfältiger Herstellung können
          produktionsbedingt Spuren weiterer Allergene nicht vollständig
          ausgeschlossen werden.
        </p>

        <h2>12. Höhere Gewalt</h2>
        <p>
          Kann eine Leistung aufgrund höherer Gewalt (z. B. Unwetter,
          Hochwasser, Stromausfall, behördliche Anordnungen, erhebliche
          Lieferengpässe oder unvorhersehbare Erkrankung) nicht oder nur
          eingeschränkt erbracht werden, haftet die Kurvenbeck GmbH hierfür
          nur im gesetzlich vorgesehenen Umfang.
        </p>

        <h2>13. Fotoaufnahmen</h2>
        <p>
          Foto- oder Videoaufnahmen von Veranstaltungen erfolgen
          ausschließlich nach vorheriger ausdrücklicher Zustimmung des
          Auftraggebers.
        </p>

        <h2>14. Haftung</h2>
        <p>
          Die Kurvenbeck GmbH haftet unbeschränkt bei Vorsatz und grober
          Fahrlässigkeit. Bei leicht fahrlässiger Verletzung wesentlicher
          Vertragspflichten ist die Haftung auf den vorhersehbaren,
          vertragstypischen Schaden beschränkt. Gesetzlich zwingende
          Haftungsvorschriften bleiben unberührt.
        </p>

        <h2>15. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Für Kaufleute und Unternehmer ist – soweit
          gesetzlich zulässig – Gerichtsstand der Sitz der Kurvenbeck GmbH.
          Sollten einzelne Bestimmungen unwirksam sein, bleibt die
          Wirksamkeit der übrigen Regelungen unberührt.
        </p>
      </div>
    </LegalPage>
  );
}
