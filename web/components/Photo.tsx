import Image from "next/image";
import type { Img } from "@/lib/images";

/**
 * Rendert ein echtes Foto (next/image, fill) sobald `img` gesetzt ist —
 * andernfalls den beschrifteten Platzhalter (gestreift, `data-label`).
 * `baseClass` erlaubt das Wiederverwenden bestehender Slot-Styles
 * (`ph`, `hc-photo`, `hero-img`).
 */
export function Photo({
  img,
  label,
  baseClass = "ph",
  className = "",
  dark = false,
  priority = false,
  sizes = "(max-width: 860px) 100vw, 50vw",
  children,
}: {
  img: Img | null;
  label: string;
  baseClass?: string;
  className?: string;
  dark?: boolean;
  priority?: boolean;
  sizes?: string;
  children?: React.ReactNode;
}) {
  const cls = [
    baseClass,
    dark ? "ph--dark" : "",
    img ? "is-filled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Slots mit eigenem Inhalt (z. B. Hero mit Headline) sind nur Bildträger —
  // dort kein role="img", sonst würde der Textinhalt für AT verdeckt.
  const decorative = Boolean(children);

  return (
    <div
      className={cls}
      data-label={img ? undefined : label}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : img ? img.alt : label}
    >
      {img ? (
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      ) : null}
      {children}
    </div>
  );
}
