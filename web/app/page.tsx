import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Photo } from "@/components/Photo";
import { photos } from "@/lib/images";
import { getOpeningStatus } from "@/lib/openingHours";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { OpeningStatusView } from "@/components/OpeningStatusView";

// Dynamisch rendern, damit der Öffnungs-Status auf der Startseite tagesaktuell ist.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [opening, contact] = await Promise.all([
    getOpeningStatus("biergarten"),
    getSiteSettings(),
  ]);
  return (
    <div className="home-bg">
      <SiteHeader action={null} />

      <section className="hero-c" data-screen-label="Home C · Hero">
        <Photo
          img={photos.homeHero}
          label="Foto: Biergarten-Atmosphäre, goldenes Abendlicht — 1920×1080"
          baseClass="hero-img"
          priority
          sizes="100vw"
        >
          <div className="scrim"></div>
          <Image
            src="/images/logo/Logo Kurvenbeck.webp"
            alt="Kurvenbeck — Biergarten, Catering, Backstube"
            width={559}
            height={557}
            className="hero-logo"
            priority
          />
          <div className="hero-inner">
            <div className="container">
              <p className="eyebrow">Aus dem Herzen der Schwäbischen Alb</p>
              <h1>Drei Leidenschaften. Ein Haus.</h1>
              <p className="tagline">{"„Frisch, ehrlich, von hier.“"}</p>
              {/* CTA-Buttons auf Wunsch entfernt */}
            </div>
          </div>
        </Photo>
      </section>

      <section className="intro-c">
        <div className="container">
          <p className="eyebrow">Willkommen bei Kurvenbeck</p>
          <h2>Bewirten, beliefern, backen</h2>
          <p>
            Hinter Kurvenbeck steckt eine junge Familie mit echter Leidenschaft
            fürs Handwerk. Selbstgemachtes aus der Backstube, persönliches
            Catering und ein Biergarten zum Wohlfühlen — alles aus einer Hand.
          </p>
        </div>
      </section>

      <section className="cards-c">
        <div className="container">
          <Link className="hcard" href="/biergarten">
            <Photo
              img={photos.homeBiergarten}
              label="Foto: Biergarten unter Kastanien, lange Tische"
              baseClass="hc-photo"
              sizes="(max-width: 860px) 100vw, 45vw"
            />
            <div className="hc-body">
              <span className="hc-kicker">
                <span className="num">1</span>
                <span className="lbl">Biergarten</span>
              </span>
              <h3>Hock di na.</h3>
              <OpeningStatusView status={opening} variant="compact" />
              <p>
                Ein kühles Glas in der Sonne, ein lauschiges Eck im Schatten
                und schwäbische Küche, die noch von Hand entsteht.
              </p>
              <span className="hc-more">Zur Speisekarte →</span>
            </div>
          </Link>

          <Link className="hcard" href="/catering">
            <Photo
              img={photos.homeCatering}
              label="Foto: Catering-Team beim Aufbau, Buffet"
              baseClass="hc-photo"
              sizes="(max-width: 860px) 100vw, 55vw"
            />
            <div className="hc-body">
              <span className="hc-kicker">
                <span className="num">2</span>
                <span className="lbl">Catering</span>
              </span>
              <h3>Dein Fest, unser Handwerk.</h3>
              <p>
                Von der kleinen Familienfeier bis zum Firmenevent mit 300
                Gästen — wir kochen, liefern und kümmern uns um alles, was
                schmeckt.
              </p>
              <span className="hc-more">Catering ansehen →</span>
            </div>
          </Link>

          <Link className="hcard" href="/backstube">
            <Photo
              img={photos.homeBackstube}
              label="Foto: Brezel wird von Hand geschlungen, Mehlstaub"
              baseClass="hc-photo"
              sizes="(max-width: 860px) 100vw, 45vw"
            />
            <div className="hc-body">
              <span className="hc-kicker">
                <span className="num">3</span>
                <span className="lbl">Backstube</span>
              </span>
              <h3>Sei schnell, sonst isch&apos;s weg.</h3>
              <p>
                Brezel, Briegl, Körnerwecken und mehr — in der Nacht von Hand
                geformt, am Morgen frisch aus dem Holzbackofen. Heute online
                vorbestellen, morgen früh abholen.
              </p>
              <span className="hc-more">Online vorbestellen →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="closing">
        <div className="container">
          <h2>Ein Anruf, ein ganzes Fest</h2>
          <p>
            Biergarten-Vesper, Catering fürs große Event oder ein Korb frischer
            Backwaren — bei Kurvenbeck bekommst du alles aus einer Hand.
          </p>
          <div className="cta-row">
            <Link href="/catering" className="btn btn-primary">
              Catering anfragen
            </Link>
            <Link href="/biergarten" className="btn btn-ghost--inverted">
              Tisch reservieren
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter contact={contact} />
    </div>
  );
}
