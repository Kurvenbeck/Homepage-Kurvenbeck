import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <LegalPage eyebrow="Rechtliches" title="Datenschutz">
      <div className="legal-content">
        <p className="legal-meta">Stand: 6. Juli 2026</p>

        <h2>Präambel</h2>
        <p>
          Mit dieser Datenschutzerklärung möchten wir dich darüber aufklären, welche
          Arten deiner personenbezogenen Daten (nachfolgend auch kurz als „Daten"
          bezeichnet) wir zu welchen Zwecken und in welchem Umfang verarbeiten. Die
          Erklärung gilt für unser gesamtes Onlineangebot unter kurvenbeck.com.
        </p>

        <h2>Verantwortlicher</h2>
        <p>
          Johannes Wehner
          <br />
          Im Hetzenloch 3
          <br />
          89558 Böhmenkirch – Schnittlingen
        </p>
        <p>
          E-Mail: <a href="mailto:kontakt@kurvenbeck.com">kontakt@kurvenbeck.com</a>
          <br />
          Impressum: <a href="/impressum">kurvenbeck.com/impressum</a>
        </p>

        <h2>Übersicht der Verarbeitungen</h2>
        <p>
          Die folgende Übersicht fasst zusammen, welche Datenarten wir zu welchen
          Zwecken verarbeiten und wen das betrifft.
        </p>
        <h3>Arten der verarbeiteten Daten</h3>
        <ul>
          <li>Kontaktdaten (Name, E-Mail-Adresse, Telefonnummer).</li>
          <li>
            Bestell- und Anfragedaten (Catering-Anfragen, Backstube-Vorbestellungen:
            Anlass/Gästezahl bzw. bestellte Positionen und Menge).
          </li>
          <li>Inhaltsdaten (Freitext-Nachrichten in Formularen).</li>
          <li>Nutzungsdaten und Meta-/Protokolldaten (IP-Adresse, Zeitstempel, Logfiles).</li>
        </ul>
        <h3>Kategorien betroffener Personen</h3>
        <ul>
          <li>Besucher unseres Onlineangebots.</li>
          <li>Gäste, die eine Catering-Anfrage stellen oder eine Backstube-Vorbestellung aufgeben.</li>
          <li>Der Betreiber selbst als Nutzer des passwortlosen Admin-Bereichs.</li>
        </ul>
        <h3>Zwecke der Verarbeitung</h3>
        <ul>
          <li>Bereitstellung unseres Onlineangebots und Gewährleistung seiner Sicherheit.</li>
          <li>Bearbeitung von Catering-Anfragen und Backstube-Vorbestellungen.</li>
          <li>Verwaltung der Website-Inhalte (Speisekarte, Öffnungszeiten) durch den Betreiber.</li>
        </ul>

        <h2>Maßgebliche Rechtsgrundlagen</h2>
        <p>
          Im Folgenden erhältst du eine Übersicht der Rechtsgrundlagen der DSGVO, auf
          deren Basis wir personenbezogene Daten verarbeiten.
        </p>
        <ul>
          <li>
            <strong>Vertrag und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b)
            DSGVO)</strong> – für die Bearbeitung deiner Catering-Anfrage bzw. deiner
            Backstube-Vorbestellung, die du aktiv über unsere Formulare an uns richtest.
          </li>
          <li>
            <strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)</strong> –
            für den technischen Betrieb, die Sicherheit und die Stabilität unseres
            Onlineangebots.
          </li>
          <li>
            <strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c) DSGVO)</strong> –
            soweit wir gesetzlich zur Verarbeitung oder Aufbewahrung bestimmter Daten
            verpflichtet sind.
          </li>
        </ul>
        <p>
          Zusätzlich zu den Regelungen der DSGVO gelten nationale Datenschutzvorgaben,
          insbesondere das Bundesdatenschutzgesetz (BDSG).
        </p>

        <h2>Sicherheitsmaßnahmen</h2>
        <p>
          Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des
          Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der
          Umstände und der Zwecke der Verarbeitung geeignete technische und
          organisatorische Maßnahmen, um ein angemessenes Schutzniveau zu gewährleisten.
        </p>
        <p>
          Alle Verbindungen zu unserem Onlineangebot sind per TLS-/SSL-Verschlüsselung
          (HTTPS) gesichert. Schreibender Zugriff auf die Formulardaten (Catering,
          Backstube) ist ausschließlich über streng geprüfte Schreibregeln (Row Level
          Security) möglich; Lesezugriff auf diese Daten hat nur der eingeloggte
          Betreiber.
        </p>

        <h2>Eingesetzte Dienstleister und Übermittlung von Daten</h2>
        <p>
          Für den Betrieb unseres Onlineangebots setzen wir folgende Dienstleister
          (Auftragsverarbeiter) ein. Mit allen Anbietern bestehen die gesetzlich
          erforderlichen Verträge zum Schutz deiner Daten.
        </p>

        <h3>Hosting bei Vercel</h3>
        <p>
          Unser Onlineangebot wird über die Infrastruktur von <strong>Vercel Inc.</strong>{" "}
          (USA) bereitgestellt. Beim Aufruf unserer Seiten verarbeitet Vercel technisch
          notwendige Zugriffsdaten (IP-Adresse, Datum und Uhrzeit des Zugriffs,
          abgerufene Seite, Browsertyp, Referrer-URL) in Form von Server-Logfiles. Diese
          dienen der Auslieferung der Seite, der Erkennung von Fehlern sowie der Abwehr
          von Missbrauch (z. B. Überlastungsangriffen).
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1
          lit. f) DSGVO). <strong>Speicherdauer:</strong> Logfiles werden nach den
          Standardfristen von Vercel gespeichert und danach automatisch gelöscht.{" "}
          <strong>Internationale Übermittlung:</strong> Da Vercel Inc. ein
          US-Unternehmen ist, erfolgt die Übermittlung auf Grundlage von
          EU-Standardvertragsklauseln.
        </p>

        <h3>Supabase (Datenbank- und Admin-Backend)</h3>
        <p>
          Speisekarte, Öffnungszeiten, Catering-Anfragen und Backstube-Vorbestellungen
          verwalten wir über <strong>Supabase Inc.</strong> (USA) als
          Backend-Dienstleister. Die eigentliche Datenverarbeitung und -speicherung
          erfolgt dabei auf Servern innerhalb der EU (Rechenzentrum Frankfurt am Main,
          Region <code>eu-central-1</code>).
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1
          lit. f) DSGVO) für den technischen Betrieb; für die konkreten Formulardaten
          gelten zusätzlich die unten genannten Rechtsgrundlagen und Fristen.{" "}
          <strong>Internationale Übermittlung:</strong> Da Supabase Inc. als
          US-Unternehmen organisiert ist, stützen wir die Zusammenarbeit auf
          EU-Standardvertragsklauseln, auch wenn die Datenverarbeitung selbst
          innerhalb der EU stattfindet.
        </p>

        <h3>Catering-Anfrage</h3>
        <p>
          Über unser Catering-Formular kannst du eine unverbindliche Anfrage stellen.
          Dabei verarbeiten wir: Name, E-Mail-Adresse, Anlass, Gästezahl, Wunschdatum
          sowie eine optionale Nachricht.
        </p>
        <p>
          <strong>Zweck:</strong> Bearbeitung deiner Anfrage und Erstellung eines
          individuellen Angebots. <strong>Rechtsgrundlage:</strong> Vorvertragliche
          Maßnahme auf deine Anfrage hin (Art. 6 Abs. 1 S. 1 lit. b) DSGVO).{" "}
          <strong>Speicherdauer:</strong> Wir löschen deine Anfragedaten spätestens{" "}
          <strong>60 Tage nach dem angegebenen Wunschdatum</strong>, sofern sich daraus
          kein weiterer Aufbewahrungsgrund ergibt (z. B. tatsächlich zustande gekommene
          Aufträge mit eigenständiger Rechnungsstellung, die den gesetzlichen
          Aufbewahrungsfristen unterliegen). Zum Schutz vor automatisiertem Spam-Versand
          setzen wir zusätzlich ein für dich nicht sichtbares Honeypot-Feld ein.
        </p>

        <h3>Backstube-Vorbestellung</h3>
        <p>
          Über unser Vorbestellsystem kannst du Backwaren für einen konkreten Backtag
          reservieren. Dabei verarbeiten wir: deinen Namen, optional E-Mail-Adresse und
          Telefonnummer, eine optionale Anmerkung sowie die von dir gewählten Positionen,
          Mengen und den Gesamtbetrag.
        </p>
        <p>
          <strong>Zweck:</strong> Zuordnung und Aushändigung der vorbestellten Ware am
          Backtag. <strong>Rechtsgrundlage:</strong> Vorvertragliche Maßnahme auf deine
          Bestellung hin (Art. 6 Abs. 1 S. 1 lit. b) DSGVO).{" "}
          <strong>Speicherdauer:</strong> Wir löschen deine Bestelldaten spätestens{" "}
          <strong>7 Tage nach dem jeweiligen Backtag</strong>. Zum Schutz vor
          automatisiertem Spam-Versand setzen wir zusätzlich ein für dich nicht
          sichtbares Honeypot-Feld ein.
        </p>

        <h3>Cookies und lokale Speicherung</h3>
        <p>
          Wir setzen <strong>keine</strong> Analyse-, Marketing- oder Tracking-Cookies
          ein. Zwei technisch notwendige Speichervorgänge kommen zum Einsatz:
        </p>
        <ul>
          <li>
            <strong>Login-Cookie im Admin-Bereich:</strong> Meldet sich der Betreiber
            unter <code>/admin</code> per Magic-Link an, setzt Supabase einen Cookie mit
            einem verschlüsselten Sitzungstoken. Dieser betrifft ausschließlich den
            Betreiber, nicht dich als Website-Besucher, und wird ausschließlich zur
            Aufrechterhaltung der eingeloggten Sitzung benötigt. Da dieser Cookie zur
            Bereitstellung eines ausdrücklich angeforderten Dienstes technisch
            zwingend erforderlich ist, ist hierfür nach § 25 Abs. 2 Nr. 2 TTDSG keine
            Einwilligung erforderlich.
          </li>
          <li>
            <strong>Warenkorb-Speicherung (Backstube):</strong> Beim Zusammenstellen
            deiner Vorbestellung speichert dein Browser die ausgewählten Positionen
            lokal (<code>localStorage</code>) auf deinem Gerät, damit dein Warenkorb
            beim erneuten Aufruf der Seite erhalten bleibt. Diese Daten werden nicht an
            unsere Server übertragen und können jederzeit über die Einstellungen deines
            Browsers gelöscht werden.
          </li>
        </ul>

        <h2>Allgemeine Informationen zur Datenspeicherung und Löschung</h2>
        <p>
          Für die oben beschriebenen Formulardaten (Catering-Anfrage,
          Backstube-Vorbestellung) gelten die dort jeweils genannten, kürzeren Fristen
          vorrangig – über diese Formulare entstehen keine Rechnungen oder sonstigen
          aufbewahrungspflichtigen Geschäftsunterlagen. Die folgenden gesetzlichen
          Aufbewahrungsfristen nach deutschem Recht betreffen ausschließlich
          tatsächliche Buchhaltungs- und Geschäftsunterlagen, falls solche entstehen:
        </p>
        <ul>
          <li>
            10 Jahre – Bücher und Aufzeichnungen, Jahresabschlüsse, Inventare (§ 147
            Abs. 1 Nr. 1 i.V.m. Abs. 3 AO, § 257 Abs. 1 Nr. 1 i.V.m. Abs. 4 HGB).
          </li>
          <li>
            8 Jahre – Buchungsbelege wie Rechnungen und Kostenbelege (§ 147 Abs. 1 Nr. 4
            und 4a AO, § 257 Abs. 1 Nr. 4 HGB).
          </li>
          <li>
            6 Jahre – übrige Geschäftsunterlagen, z. B. empfangene Geschäftsbriefe (§
            147 Abs. 1 Nr. 2, 3, 5 AO, § 257 Abs. 1 Nr. 2 u. 3 HGB).
          </li>
          <li>
            3 Jahre – Daten zur Berücksichtigung etwaiger Gewährleistungs- oder
            Schadensersatzansprüche entsprechend der gesetzlichen Verjährungsfrist (§§
            195, 199 BGB).
          </li>
        </ul>

        <h2>Rechte der betroffenen Personen</h2>
        <p>
          Dir stehen als betroffene Person nach der DSGVO verschiedene Rechte zu, die
          du uns gegenüber jederzeit geltend machen kannst:
        </p>
        <ul>
          <li>
            <strong>Recht auf Auskunft</strong> (Art. 15 DSGVO) darüber, ob und welche
            Daten wir über dich verarbeiten.
          </li>
          <li><strong>Recht auf Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO).</li>
          <li>
            <strong>Recht auf Löschung</strong> deiner Daten (Art. 17 DSGVO), z. B. wenn
            sie für die verfolgten Zwecke nicht mehr erforderlich sind.
          </li>
          <li>
            <strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO).
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO) für Daten,
            die du uns bereitgestellt hast.
          </li>
          <li>
            <strong>Widerspruchsrecht</strong> (Art. 21 DSGVO) gegen Verarbeitungen, die
            auf berechtigten Interessen beruhen.
          </li>
          <li>
            <strong>Recht auf Widerruf erteilter Einwilligungen</strong> (Art. 7 Abs. 3
            DSGVO) mit Wirkung für die Zukunft, soweit eine Verarbeitung auf einer
            Einwilligung beruht.
          </li>
          <li>
            <strong>Beschwerderecht bei einer Aufsichtsbehörde</strong> (Art. 77 DSGVO),
            insbesondere bei der für unseren Sitz zuständigen
            Datenschutzaufsichtsbehörde.
          </li>
        </ul>
        <p>
          Zur Wahrnehmung deiner Rechte genügt eine formlose Nachricht an{" "}
          <a href="mailto:kontakt@kurvenbeck.com">kontakt@kurvenbeck.com</a>.
        </p>

        <h2>Änderung und Aktualisierung</h2>
        <p>
          Wir bitten dich, dich regelmäßig über den Inhalt dieser Datenschutzerklärung
          zu informieren. Wir passen sie an, sobald Änderungen an unserer
          Datenverarbeitung dies erforderlich machen.
        </p>

        <h2>Begriffsdefinitionen</h2>
        <p>
          Soweit die folgenden Begriffe gesetzlich definiert sind, gelten deren
          gesetzliche Definitionen. Die Erläuterungen dienen dem allgemeinen
          Verständnis.
        </p>
        <ul>
          <li>
            <strong>Personenbezogene Daten:</strong> alle Informationen, die sich auf
            eine identifizierte oder identifizierbare natürliche Person beziehen.
          </li>
          <li>
            <strong>Verarbeitung:</strong> jeder Vorgang im Zusammenhang mit
            personenbezogenen Daten, etwa das Erheben, Speichern, Übermitteln oder
            Löschen.
          </li>
          <li>
            <strong>Verantwortlicher:</strong> die Stelle, die über die Zwecke und
            Mittel der Verarbeitung personenbezogener Daten entscheidet.
          </li>
          <li>
            <strong>Kontaktdaten:</strong> Informationen, die die Kommunikation mit
            einer Person ermöglichen, z. B. Telefonnummer, Adresse, E-Mail-Adresse.
          </li>
          <li>
            <strong>Protokolldaten:</strong> Informationen über Ereignisse in einem
            System, z. B. Zeitstempel, IP-Adressen und Fehlermeldungen.
          </li>
        </ul>
      </div>
    </LegalPage>
  );
}
