import Link from "next/link";
import { Logo } from "./Logo";
import { FALLBACK_CONTACT, type SiteContact } from "@/lib/siteSettings";

export function SiteFooter({
  contact = FALLBACK_CONTACT,
}: {
  contact?: SiteContact;
}) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo asLink={false} />
            <p>
              Biergarten, Catering und Backstube — drei Handwerke, ein
              Familienbetrieb.
            </p>
          </div>
          <div>
            <h4>Bereiche</h4>
            <ul>
              <li>
                <Link href="/biergarten">Biergarten</Link>
              </li>
              <li>
                <Link href="/catering">Catering</Link>
              </li>
              <li>
                <Link href="/backstube">Backstube</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Kontakt</h4>
            <ul>
              {contact.addressLines.length > 0 && (
                <li>{contact.addressLines.join(", ")}</li>
              )}
              <li>
                <a href={contact.telHref}>{contact.phoneDisplay}</a>
              </li>
              <li>
                <a href="mailto:hallo@kurvenbeck.de">hallo@kurvenbeck.de</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Kurvenbeck Familienbetrieb</span>
          <span>
            <Link href="/impressum">Impressum</Link> ·{" "}
            <Link href="/datenschutz">Datenschutz</Link> ·{" "}
            <Link href="/agb">AGB</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
