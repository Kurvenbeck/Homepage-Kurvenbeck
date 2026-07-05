import Link from "next/link";

/** Bereichs-Navigation der Verwaltung: Speisekarte ↔ Öffnungszeiten. */
export function AdminNav({ active }: { active: "menu" | "hours" }) {
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
    </nav>
  );
}
