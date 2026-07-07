import type { Metadata } from "next";
import { IconShoppingBag } from "@tabler/icons-react";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { Photo } from "@/components/Photo";
import { backstubePhotos } from "@/lib/images";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getMenu } from "@/lib/menu";
import { getBacktag } from "@/lib/getBacktag";
import { BackstubeOrder } from "@/components/backstube/BackstubeOrder";

export const metadata: Metadata = {
  title: "Backstube",
  description:
    "Brezel, Briegl und Körnerwecken — frisch aus dem Steinofen. Vorbestellen bis 18 Uhr am Vortag, am nächsten Abholtag frisch abholen.",
};

// Dynamisch rendern, damit Änderungen des Kunden am Sortiment sofort live sind.
export const dynamic = "force-dynamic";

export default async function BackstubePage() {
  const [menu, contact, backtag] = await Promise.all([
    getMenu("backstube"),
    getSiteSettings(),
    getBacktag(),
  ]);

  return (
    <>
      <SiteHeader
        active="backstube"
        logoSuffix="Backstube"
        action={
          <a href="#bestellen" className="btn btn-ghost">
            <IconShoppingBag size={18} stroke={1.75} aria-hidden />
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
            <li>Backwaren aussuchen und in den Warenkorb legen</li>
            <li>Vorbestellung mit deinem Namen abschicken</li>
            <li>Am Backtag frisch abholen — bezahlt wird bei der Abholung</li>
          </ol>
        </div>
      </div>

      <div className="container">
        <div className="section-head" style={{ paddingTop: "var(--space-16)" }}>
          <p className="eyebrow">Aus dem Ofen</p>
          <h2>Stell dir dein Frühstück für morgen zusammen</h2>
          <p>Preise pro Stück, inkl. MwSt. Vorbestellung direkt hier — kein WhatsApp nötig.</p>
        </div>
      </div>

      <BackstubeOrder menu={menu} backtag={backtag} />

      <SiteFooter contact={contact} />
    </>
  );
}
