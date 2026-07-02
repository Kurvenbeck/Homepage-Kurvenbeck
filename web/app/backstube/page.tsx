import type { Metadata } from "next";
import { whatsappHref } from "@/lib/siteSettings";
import { Photo } from "@/components/Photo";
import { backstubePhotos } from "@/lib/images";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartProvider } from "@/components/cart/CartContext";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductGrid } from "@/components/cart/ProductGrid";

export const metadata: Metadata = {
  title: "Backstube",
  description:
    "Brezel, Briegl und Körnerwecken — frisch aus dem Steinofen. Heute online vorbestellen, morgen früh abholen.",
};

export default function BackstubePage() {
  return (
    <CartProvider>
      <SiteHeader
        active="backstube"
        logoSuffix="Backstube"
        action={<CartButton />}
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
                geformt, am Morgen frisch aus dem Holzbackofen. Wähle deine
                Backwaren, bestelle bis 18 Uhr am Vortag und hole sie am nächsten
                Abholtag ab.
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
              Aktuelle Abholtage auf dieser Seite oder per{" "}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>Bestellung bis 18 Uhr am Vortag</li>
            <li>Abholung am gewählten Termin — frisch aus dem Ofen</li>
          </ol>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Aus dem Ofen</p>
            <h2>Heute frisch gebacken</h2>
            <p>Vorbestellen für die Abholung. Preise pro Stück, inkl. MwSt.</p>
          </div>
          <ProductGrid />
        </div>
      </section>

      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
