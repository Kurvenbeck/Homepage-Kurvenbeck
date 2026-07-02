import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Photo } from "@/components/Photo";
import { photos } from "@/lib/images";
import { CateringForm } from "@/components/CateringForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Von der Familienfeier bis zum Firmenevent — wir kochen, liefern und kümmern uns um alles, was schmeckt.",
};

export default function CateringPage() {
  return (
    <>
      <SiteHeader
        active="catering"
        logoSuffix="Tradition"
        action={
          <a href="#anfrage" className="btn btn-primary">
            Anfrage senden
          </a>
        }
      />

      <section className="page-hero page-hero--photo" data-screen-label="Catering Hero">
        <Photo
          img={photos.cateringBuffet}
          label="Foto: Schwäbisches Buffet – Catering Kurvenbeck"
          baseClass="subpage-hero-img"
          priority
          sizes="100vw"
        >
          <div className="scrim" />
          <div className="subpage-hero-inner">
            <div className="container">
              <p className="eyebrow">Catering</p>
              <h1>Dein Fest, unser Handwerk.</h1>
              <p className="lede">
                Von der kleinen Familienfeier bis zum Firmenevent mit 300 Gästen —
                wir kochen, liefern und kümmern uns um alles, was schmeckt.
              </p>
            </div>
          </div>
        </Photo>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Beispiele aus unserer Küche</p>
            <h2>Was wir für dich zaubern</h2>
            <p>
              Jedes Menü stellen wir individuell zusammen. Hier ein paar
              Lieblinge unserer Kunden als Inspiration.
            </p>
          </div>
          <div className="cat-grid">
            <div className="cat-card">
              <Photo
                img={photos.cateringFingerfood}
                label="Foto: Fingerfood-Platte, Häppchen — 3:2"
                sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              />
              <div className="cat-body">
                <h3>Fingerfood & Flying Buffet</h3>
                <p>
                  Bunte Häppchen, die durch den Raum getragen werden — von
                  Lachs-Praline bis Mini-Maultasche. Perfekt für Empfänge &
                  Vernissagen.
                </p>
                <span className="cat-meta">
                  ab 18 € pro Person · ab 20 Gäste
                </span>
                <span className="cat-more">Menü ansehen →</span>
              </div>
            </div>

            <div className="cat-card">
              <Photo
                img={photos.cateringBuffet}
                label="Foto: Schwäbisches Buffet, Spätzle — 3:2"
                sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              />
              <div className="cat-body">
                <h3>Schwäbisches Buffet</h3>
                <p>
                  Maultaschen, Käsespätzle, Linsen mit Saitenwürstle,
                  Kartoffelsalat & Zwiebelrostbraten. Heimat zum Sattessen.
                </p>
                <span className="cat-meta">
                  ab 26 € pro Person · ab 30 Gäste
                </span>
                <span className="cat-more">Menü ansehen →</span>
              </div>
            </div>

            <div className="cat-card">
              <Photo
                img={null}
                label="Foto: Geburtstagstafel, festlich — 3:2"
                sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              />
              <div className="cat-body">
                <h3>Geburtstage & Jubiläen</h3>
                <p>
                  Ob runder Geburtstag oder besonderes Jubiläum — wir
                  gestalten dein Fest mit Herz, gutem Essen und dem richtigen
                  Rahmen.
                </p>
                <span className="cat-meta">individuelles Angebot</span>
                <span className="cat-more">Menü ansehen →</span>
              </div>
            </div>

            <div className="cat-card">
              <Photo
                img={photos.cateringHochzeit}
                label="Foto: Hochzeitstafel, festlich gedeckt — 3:2"
                sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              />
              <div className="cat-body">
                <h3>Hochzeits-Menü</h3>
                <p>
                  Mehrgängig serviert, mit Service-Team und passendem Geschirr.
                  Der schönste Tag — kulinarisch begleitet.
                </p>
                <span className="cat-meta">individuelles Angebot</span>
                <span className="cat-more">Menü ansehen →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section process-wrap">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">So einfach geht&apos;s</p>
            <h2>In vier Schritten zum Fest</h2>
          </div>
          <div className="process">
            <div className="step">
              <div className="num">01</div>
              <h4>Anfragen</h4>
              <p>
                Erzähl uns von Anlass, Datum und Gästezahl — unverbindlich
                über das Formular.
              </p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h4>Beraten</h4>
              <p>
                Wir melden uns binnen 48 Stunden und stellen ein Menü ganz nach
                deinem Geschmack zusammen.
              </p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h4>Genießen</h4>
              <p>
                Wir liefern, bauen auf und kümmern uns auf Wunsch um den
                kompletten Service vor Ort.
              </p>
            </div>
            <div className="step">
              <div className="num">04</div>
              <h4>Abräumen</h4>
              <p>
                Geschirr, Reste, Aufbau — alles nehmen wir wieder mit. Du
                feierst, wir machen sauber.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="anfrage">
        <div className="container anfrage">
          <div>
            <p className="eyebrow">Unverbindlich anfragen</p>
            <h2
              style={{
                fontSize: "var(--text-4xl)",
                marginTop: "var(--space-3)",
              }}
            >
              Lass uns dein Fest planen
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-lg)",
                marginTop: "var(--space-4)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Sag uns kurz, was du vorhast. Wir erstellen ein passendes
              Angebot — kostenlos und ohne Verpflichtung.
            </p>
            <ul className="quote-list">
              <li>
                <span className="dot"></span> Antwort innerhalb von 48 Stunden
              </li>
              <li>
                <span className="dot"></span> Lieferung im Umkreis von 40 km
              </li>
              <li>
                <span className="dot"></span> Vegetarische & vegane Optionen für
                jedes Menü
              </li>
              <li>
                <span className="dot"></span> Geschirr, Besteck & Service auf
                Wunsch
              </li>
            </ul>
          </div>
          <CateringForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
