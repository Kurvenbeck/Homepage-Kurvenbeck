import Link from "next/link";

/**
 * Wortmarke-Fallback laut Design-Guide (echtes Logo-Asset noch ausstehend).
 * „Kurven" in --color-primary + „beck" in --color-accent.
 */
export function Logo({
  suffix,
  asLink = true,
}: {
  suffix?: string;
  asLink?: boolean;
}) {
  const inner = (
    <>
      Kurven<span className="kb-mark">beck</span>
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
