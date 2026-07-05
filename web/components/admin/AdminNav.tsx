import Link from "next/link";

/** Bereichs-Navigation der Verwaltung: Speisekarte ↔ Öffnungszeiten ↔ Anfragen ↔ Einstellungen. */
export function AdminNav({
  active,
}: {
  active: "menu" | "hours" | "catering" | "settings";
}) {
  return (
    <nav className="admin-nav" aria-label="Verwaltungsbereiche">
      <Link
        href="/admin"
        className={`admin-nav-link${active === "menu" ? " is-active" : ""}`}
        aria-current={active === "menu" ? "page" : undefined}
      >
        Speisekarte
      </Link>
      <Link
        href="/admin/oeffnungszeiten"
        className={`admin-nav-link${active === "hours" ? " is-active" : ""}`}
        aria-current={active === "hours" ? "page" : undefined}
      >
        Öffnungszeiten
      </Link>
      <Link
        href="/admin/catering"
        className={`admin-nav-link${active === "catering" ? " is-active" : ""}`}
        aria-current={active === "catering" ? "page" : undefined}
      >
        Anfragen
      </Link>
      <Link
        href="/admin/einstellungen"
        className={`admin-nav-link${active === "settings" ? " is-active" : ""}`}
        aria-current={active === "settings" ? "page" : undefined}
      >
        Einstellungen
      </Link>
    </nav>
  );
}
