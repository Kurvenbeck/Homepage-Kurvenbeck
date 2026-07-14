import type { Metadata } from "next";
import Link from "next/link";
import { IconPhone, IconBrandWhatsapp } from "@tabler/icons-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooterServer } from "@/components/SiteFooterServer";
import { Photo } from "@/components/Photo";
import { photos } from "@/lib/images";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { getMenu } from "@/lib/menu";
import { getOpeningStatus } from "@/lib/openingHours";
import { OpeningStatusView } from "@/components/OpeningStatusView";
import { MenuRecommendations } from "@/components/MenuRecommendations";

export const metadata: Metadata = {
  title: "Biergarten",
  description:
    "Schwäbische Küche, kühle Getränke und schattige Plätze — nur am Wochenende und an Feiertagen.",
};

// Dynamisch rendern, damit Änderungen des Kunden an der Karte sofort live sind.
export const dynamic = "force-dynamic";

export default async function BiergartenPage() {
  const [menu, opening, contact] = await Promise.all([
    getMenu("biergarten"),
    getOpeningStatus("biergarten"),
    getSiteSettings(),
  ]);
  return (
    <>
      <SiteHeader
        active="biergarten"
        logoSuffix="Tradition"
        action={
          <>
            <a href={contact.telHref} className="icon-cta icon-cta--phone" aria-label="Tisch reservieren – anrufen">
              <IconPhone size={20} stroke={1.75} aria-hidden />
            </a>
            <a
              href={contact.whatsappHref}
              className="icon-cta icon-cta--whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tisch reservieren – per WhatsApp"
            >
              <IconBrandWhatsapp size={20} stroke={1.75} aria-hidden />
            </a>
          </>
        }
      />

      <section className="page-hero page-hero--photo" data-screen-label="Biergarten Hero">
        <Photo
          img={photos.biergartenGarten}
          label="Foto: Biergarten – Außenbereich mit Abendsonne"
          baseClass="subpage-hero-img"
          priority
          sizes="100vw"
        >
          <div className="scrim" />
          <div className="subpage-hero-inner">
            <div className="container">
              <p className="eyebrow">Biergarten</p>
              <h1>Hock di na.</h1>
              <p className="lede">
                Ein kühles Glas in der Sonne, ein lauschiges Eck im Schatten und
                schwäbische Küche, die noch von Hand entsteht.
              </p>
            </div>
          </div>
        </Photo>
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
              <a href={contact.telHref} className="btn btn-ghost">
                <IconPhone size={18} stroke={1.75} aria-hidden />
                Tisch reservieren
              </a>
              <a
                href={contact.whatsappHref}
                className="btn btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden />
                WhatsApp
              </a>
            </div>

            <OpeningStatusView status={opening} />
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
          <MenuRecommendations items={menu.recommendations} />
          <div className="menu-grid">
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
                      <span className="mi-price">
                        {item.secondSize ? (
                          <>
                            <span className="mi-price-line">
                              {item.sizeLabel && (
                                <span className="mi-price-size">{item.sizeLabel}</span>
                              )}
                              {item.price}
                            </span>
                            <span className="mi-price-line">
                              <span className="mi-price-size">{item.secondSize.label}</span>
                              {item.secondSize.price}
                            </span>
                          </>
                        ) : item.sizeLabel ? (
                          <span className="mi-price-line">
                            <span className="mi-price-size">{item.sizeLabel}</span>
                            {item.price}
                          </span>
                        ) : (
                          item.price
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {menu.legend.length > 0 && (
            <div className="menu-legend">
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="info-cards">
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

      <SiteFooterServer />
    </>
  );
}
