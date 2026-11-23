import type { Metadata } from "next";
import { buildMockData } from "@/lib/auswertungMock";
import { AuswertungDashboard } from "@/components/admin/auswertung/Dashboard";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Auswertung (Prototyp)",
  robots: { index: false, follow: false },
};

export default function AuswertungPrototypPage() {
  const data = buildMockData();
  return (
    <>
      <SiteHeader logoSuffix="Admin" />
      <section className="section ausw-section">
        <div className="container ausw-container">
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung · Prototyp mit Beispieldaten</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>Auswertung</h1>
              <p className="admin-intro" style={{ marginTop: "var(--space-2)" }}>
                So lief deine Backstube — verständlich auf einen Blick.
              </p>
            </div>
          </div>
          <AuswertungDashboard data={data} />
        </div>
      </section>
    </>
  );
}
