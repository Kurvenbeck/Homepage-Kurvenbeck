import type { Metadata } from "next";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { whatsappHref } from "@/lib/siteSettings";
import { Photo } from "@/components/Photo";
import { backstubePhotos } from "@/lib/images";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Backstube",
  description:
    "Brezel, Briegl und Körnerwecken — frisch aus dem Steinofen. Vorbestellen bis 18 Uhr am Vortag, am nächsten Abholtag frisch abholen.",
};

// Dynamisch rendern, damit Änderungen des Kunden am Sortiment sofort live sind.
export const dynamic = "force-dynamic";

export default async function BackstubePage() {
  const menu = await getMenu("backstube");

  return (
    <>
      <SiteHeader
        active="backstube"
        logoSuffix="Backstube"
        action={
          <a
            href={whatsappHref}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden />
            Vorbestellen
          </a>
        }
      />

      <section className="page-hero page-hero--photo" data-screen-label="Backstube Hero">
        <Photo
          img={backstubePhotos.brezel}
          label="Foto: Frische Laugenbrezel aus der Kurvenbeck-Backstube"
          baseClass="subpage-hero-img"
          priority
          sizes="100vw"
        >
          <div className="scrim" />
          <div className="subpage-hero-inner">
            <div className="container">
              <p className="eyebrow">Backstube</p>
              <h1>Sei schnell, sonst isch&apos;s weg</h1>
              <p className="lede">
                Brezel, Briegl, Körnerwecken und mehr — in der Nacht von Hand
                geformt, am Morgen frisch aus dem Holzbackofen. Such dir deine
                Backwaren aus, bestelle bis 18 Uhr am Vortag vor und hole sie am
                nächsten Abholtag ab.
              </p>
            </div>
          </div>
        </Photo>
      </section>

      <div className="info-banner">
        <div className="container">
          <p>
            <strong>So funktioniert&apos;s:</strong>
          </p>
          <ol className="info-steps">
            <li>
              Aktuelle Abholtage erfragst du per{" "}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>Bestellung bis 18 Uhr am Vortag</li>
            <li>Abholung am gewählten Termin — frisch aus dem Ofen</li>
          </ol>
        </div>
      </div>

      <section className="section menu-wrap" id="sortiment">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Aus dem Ofen</p>
            <h2>Heute frisch gebacken</h2>
            <p>Preise pro Stück, inkl. MwSt. Vorbestellung per WhatsApp.</p>
          </div>

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
                      <span className="mi-price">{item.price}</span>
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

      <SiteFooter />
    </>
  );
}
