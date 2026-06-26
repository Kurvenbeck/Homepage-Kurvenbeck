"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

type NavKey = "biergarten" | "catering" | "backstube";

const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: "biergarten", href: "/biergarten", label: "Biergarten" },
  { key: "catering", href: "/catering", label: "Catering" },
  { key: "backstube", href: "/backstube", label: "Backstube" },
];

/**
 * Globaler Header. `action` füllt den rechten Slot (Default: Catering-CTA);
 * die Backstube reicht hier ihren Warenkorb-Button hinein.
 * Mobile-Navigation (Hamburger/Off-Canvas) ist hier ergänzt — im Prototyp offener Punkt.
 */
export function SiteHeader({
  active,
  logoSuffix = "seit 1978",
  action = (
    <Link href="/catering" className="btn btn-primary">
      Catering anfragen
    </Link>
  ),
}: {
  active?: NavKey;
  logoSuffix?: string;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container">
        <Logo suffix={logoSuffix} />

        <nav className="site-nav" aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={active === item.key ? "active" : undefined}
              aria-current={active === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {action}
          <button
            type="button"
            className="nav-toggle"
            aria-label="Menü öffnen"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`mobile-nav-scrim${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div id="mobile-nav" className={`mobile-nav${open ? " open" : ""}`}>
        <div className="mobile-nav-head">
          <Logo suffix={logoSuffix} />
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={active === item.key ? "active" : undefined}
            aria-current={active === item.key ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div onClick={() => setOpen(false)}>{action}</div>
      </div>
    </header>
  );
}
