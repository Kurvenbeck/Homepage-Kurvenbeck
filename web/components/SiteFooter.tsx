import Link from "next/link";
import { Logo } from "./Logo";
import { siteSettings, telHref } from "@/lib/siteSettings";

export function SiteFooter() {
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
              <li>Mühlweg 12, 72074 Musterstadt</li>
              <li>
                <a href={telHref}>{siteSettings.contactPhone.display}</a>
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
