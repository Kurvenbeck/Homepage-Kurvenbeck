import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Schlichtes Chrome für Rechts-/Standardseiten (README §12.5).
 * Inhalte sind Platzhalter und vor Live-Gang vom Betreiber zu befüllen.
 */
export function LegalPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: "70ch" }}>
          {children}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
