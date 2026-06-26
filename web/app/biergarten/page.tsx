import type { Metadata } from "next";
import Link from "next/link";
import { IconPhone, IconBrandWhatsapp } from "@tabler/icons-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Photo } from "@/components/Photo";
import { photos } from "@/lib/images";
import { telHref, whatsappHref } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Biergarten",
  description:
    "Schwäbische Küche, kühle Getränke und schattige Plätze unter alten Kastanien.",
};

export default function BiergartenPage() {
  return (
    <>
      <SiteHeader
        active="biergarten"
        logoSuffix="Tradition"
        action={
          <Link href="/catering" className="btn btn-ghost">
            Tisch reservieren
          </Link>
        }
      />

      <section className="page-hero" data-screen-label="Biergarten Hero">
        <div className="container">
          <p className="eyebrow">Biergarten</p>
          <h1>Hock di na.</h1>
          <p className="lede">
            Ein kühles Glas in der Sonne, ein lauschiges Eck im Schatten und
            schwäbische Küche, die noch von Hand entsteht.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container biergarten-intro">
          <div>
            <p className="eyebrow">Unser Biergarten</p>
            <h2
              style={{
                fontSize: "var(--text-4xl)",
                marginTop: "var(--space-3)",
              }}
            >
              Der schönste Grund, das Wochenende draußen zu verbringen.
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-lg)",
                marginTop: "var(--space-4)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              180 Plätze, frisch gezapftes Bier, selbst gemachtes Essen — und
              eine Aussicht auf die Schwäbische Alb, die keiner so schnell
              vergisst. Ob Cocktail in der Sonne oder Alkoholfreies im Schatten,
              ob Familie oder große Runde: bei uns sitzt man gern länger.
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                marginTop: "var(--space-8)",
                flexWrap: "wrap",
              }}
            >
              <a href="#speisekarte" className="btn btn-primary">
                Zur Speisekarte
              </a>
              <a href={telHref} className="btn btn-ghost">
                <IconPhone size={18} stroke={1.75} aria-hidden />
                Tisch reservieren
              </a>
              <a
                href={whatsappHref}
                className="btn btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>
          <Photo
            img={photos.biergartenGarten}
            label="Foto: Biergarten unter Kastanien, Abendsonne — 4:5"
          />
        </div>
      </section>

      <section className="section menu-wrap" id="speisekarte">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Speisekarte</p>
            <h2>Drau&szlig;&apos; schmeckt&apos;s am besten</h2>
            <p>Täglich frisch, regional eingekauft. Preise inkl. MwSt.</p>
          </div>
          <div className="menu-grid">
            <div className="menu-block">
              <h3>Vesper &amp; Warmes</h3>
              <div className="menu-list">
                <div className="menu-item">
                  <span className="mi-name">
                    Original Kurvenbeck-Brezel{" "}
                    <span className="mi-desc">
                      mit guter Butter, frisch aus der eigenen Backstube
                    </span>
                  </span>
                  <span className="mi-price">3,80</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Schwäbischer Wurstsalat{" "}
                    <span className="mi-desc">
                      mit Bauernbrot &amp; Röstzwiebeln
                    </span>
                  </span>
                  <span className="mi-price">9,50</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Maultaschen in der Brühe{" "}
                    <span className="mi-desc">
                      hausgemacht, mit Schnittlauch
                    </span>
                  </span>
                  <span className="mi-price">11,80</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Käsespätzle{" "}
                    <span className="menu-tag">vegetarisch</span>
                    <span className="mi-desc">
                      mit Bergkäse &amp; gerösteten Zwiebeln
                    </span>
                  </span>
                  <span className="mi-price">12,90</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Schnitzel mit Pommes{" "}
                    <span className="mi-desc">
                      vom Schwein, mit Zitrone &amp; Preiselbeeren
                    </span>
                  </span>
                  <span className="mi-price">15,80</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Große Vesperplatte{" "}
                    <span className="mi-desc">
                      Wurst, Käse, Brezel, Gewürzgurke — zum Teilen
                    </span>
                  </span>
                  <span className="mi-price">16,50</span>
                </div>
              </div>
            </div>

            <div className="menu-block">
              <h3>Getränke</h3>
              <div className="menu-list">
                <div className="menu-item">
                  <span className="mi-name">
                    Helles vom Fass{" "}
                    <span className="mi-desc">0,5 l, frisch gezapft</span>
                  </span>
                  <span className="mi-price">4,40</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Naturtrübes Radler{" "}
                    <span className="mi-desc">0,5 l</span>
                  </span>
                  <span className="mi-price">4,20</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Weizenbier{" "}
                    <span className="mi-desc">hell oder dunkel, 0,5 l</span>
                  </span>
                  <span className="mi-price">4,60</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Apfelschorle{" "}
                    <span className="mi-desc">vom Streuobst, 0,4 l</span>
                  </span>
                  <span className="mi-price">3,60</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Trollinger im Viertele{" "}
                    <span className="mi-desc">
                      0,25 l, vom Weingut nebenan
                    </span>
                  </span>
                  <span className="mi-price">5,20</span>
                </div>
                <div className="menu-item">
                  <span className="mi-name">
                    Hausgemachte Limonade{" "}
                    <span className="menu-tag">alkoholfrei</span>
                    <span className="mi-desc">
                      Holunder oder Zitrone, 0,4 l
                    </span>
                  </span>
                  <span className="mi-price">3,80</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="info-cards">
            <div className="info-card">
              <h4>Öffnungszeiten</h4>
              <p className="big">11 – 23 Uhr</p>
              <p style={{ marginTop: "var(--space-2)" }}>
                Di – So &amp; an Feiertagen.
                <br />
                Montag Ruhetag.
                <br />
                Bei schönem Wetter durchgehend warme Küche.
              </p>
            </div>
            <div className="info-card">
              <h4>Finden &amp; Parken</h4>
              <p>
                Mühlweg 12
                <br />
                72074 Musterstadt
              </p>
              <p style={{ marginTop: "var(--space-3)" }}>
                Kostenlose Parkplätze direkt am Garten, 6 Min. vom Bahnhof.
              </p>
            </div>
            <div className="info-card">
              <h4>Größere Runden</h4>
              <p>
                Vereinsausflug, Geburtstag oder Firmenfeier? Wir reservieren
                gern lange Tische.
              </p>
              <Link
                href="/catering"
                className="text-link"
                style={{
                  display: "inline-block",
                  marginTop: "var(--space-3)",
                  fontWeight: 500,
                }}
              >
                Anfrage senden →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
