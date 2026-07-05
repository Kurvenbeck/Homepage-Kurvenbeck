import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/server";
import { getMenu } from "@/lib/menu";
import { Logo } from "@/components/Logo";
import { PrintMenuToolbar } from "@/components/admin/PrintMenuToolbar";

// Immer den aktuellen Live-Stand aus der DB drucken.
export const dynamic = "force-dynamic";

/** Öffentliche Karte, auf die der QR-Code zeigt (Gäste am Handy). */
const PUBLIC_MENU_URL = "https://kurvenbeck.com/biergarten";

/**
 * Druckbare A4-Tisch-Speisekarte für den Biergarten. Auth-geschützt (nur der
 * eingeloggte Betreiber, Route-Schutz in middleware.ts + Admin-Check hier).
 * Rendert dasselbe Live-Menü wie die Website; gedruckt bzw. „als PDF gesichert"
 * über den Browser-Dialog. Kein serverseitiger PDF-/Word-Export nötig.
 */
export default async function PrintMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();
  if (!adminRow) redirect("/admin");

  const [menu, qrSvg] = await Promise.all([
    getMenu("biergarten"),
    QRCode.toString(PUBLIC_MENU_URL, { type: "svg", margin: 0 }),
  ]);

  const printedOn = new Date().toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });

  return (
    <div className="print-page">
      <PrintMenuToolbar />

      <div className="print-sheet">
        <header className="print-head">
          <Logo suffix="Biergarten" asLink={false} />
          <div className="print-head-title">
            <p className="eyebrow">Speisekarte</p>
            <h1>Drau&szlig;&apos; schmeckt&apos;s am besten</h1>
          </div>
        </header>

        {menu.recommendations.length > 0 && (
          <div className="print-recommendations">
            {menu.recommendations.map((item) => (
              <div className="menu-recommendation" key={item.id}>
                <p className="menu-recommendation-eyebrow">Empfehlung des Hauses</p>
                <div className="menu-recommendation-head">
                  <span className="menu-recommendation-name">{item.name}</span>
                  <span className="menu-recommendation-price">{item.price}</span>
                </div>
                {item.description && (
                  <p className="menu-recommendation-desc">{item.description}</p>
                )}
                {(item.tags.length > 0 || item.allergens.length > 0) && (
                  <p className="menu-recommendation-meta">
                    {item.tags.map((tag) => (
                      <span className="menu-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                    {item.allergens.length > 0 && (
                      <span className="mi-allergens">({item.allergens.join(", ")})</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="print-menu-grid">
          {menu.categories.map((category) => (
            <div className="menu-block" key={category.id}>
              <h3>{category.title}</h3>
              <div className="menu-list">
                {category.items.map((item) => (
                  <div className="menu-item" key={item.id}>
                    <span className="mi-name">
                      {item.name}
                      {item.allergens.length > 0 && (
                        <span className="mi-allergens">
                          ({item.allergens.join(", ")})
                        </span>
                      )}
                      {item.tags.map((tag) => (
                        <span className="menu-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                      {item.description && (
                        <span className="mi-desc">{item.description}</span>
                      )}
                    </span>
                    <span className="mi-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {menu.legend.length > 0 && (
          <div className="menu-legend print-legend">
            <p className="eyebrow">Allergene</p>
            <dl>
              {menu.legend.map((entry) => (
                <div key={entry.code}>
                  <dt>{entry.code}</dt>
                  <dd>{entry.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <footer className="print-foot">
          <div
            className="print-qr"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div className="print-foot-text">
            <p className="print-foot-lead">Immer die aktuelle Karte am Handy</p>
            <p>
              QR-Code scannen oder <strong>kurvenbeck.com/biergarten</strong> —
              inkl. aller Allergene &amp; Kennzeichnungen.
            </p>
            <p className="print-foot-meta">
              Preise inkl. MwSt. · Stand {printedOn}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
