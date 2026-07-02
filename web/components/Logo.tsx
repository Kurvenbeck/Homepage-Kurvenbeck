import Link from "next/link";
import Image from "next/image";

export function Logo({
  suffix,
  asLink = true,
}: {
  suffix?: string;
  asLink?: boolean;
}) {
  const inner = (
    <>
      <Image
        src="/images/logo/Logo Kurvenbeck.webp"
        alt="Kurvenbeck — Biergarten, Catering, Backstube"
        width={559}
        height={557}
        className="kb-logo-img"
        priority
      />
      {suffix ? <small>{suffix}</small> : null}
    </>
  );

  if (asLink) {
    return (
      <Link href="/" className="kb-logo" aria-label="Kurvenbeck — Startseite">
        {inner}
      </Link>
    );
  }
  return <span className="kb-logo">{inner}</span>;
}
