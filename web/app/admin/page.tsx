import { redirect } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import { getMenuForAdmin } from "@/lib/menu";
import { MenuAdmin } from "@/components/admin/MenuAdmin";
import { MENU_AREAS, type MenuArea } from "@/lib/menuAreas";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

/** Bereich aus `?area=` lesen; unbekannte/fehlende Werte → Biergarten. */
function resolveArea(value: string | string[] | undefined): MenuArea {
  const area = Array.isArray(value) ? value[0] : value;
  return (MENU_AREAS as readonly string[]).includes(area ?? "")
    ? (area as MenuArea)
    : "biergarten";
}

/** Abmelden (Server Action) — verwirft die Sitzung und leitet zum Login. */
async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string | string[] }>;
}) {
  const area = resolveArea((await searchParams).area);
  const supabase = await createClient();

  // Middleware hat bereits auf eingeloggt geprüft; hier zusätzlich (Defense in
  // Depth) verifizieren, dass die E-Mail in der Admin-Allowlist steht. RLS gibt
  // eingeloggten Nutzern nur ihre eigene admins-Zeile frei.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  const isAdmin = Boolean(adminRow);
  const menu = isAdmin ? await getMenuForAdmin(area) : null;

  return (
    <>
      <SiteHeader logoSuffix="Admin" />

      <section className="section">
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
                {isAdmin ? "Speisekarte" : "Kein Zugriff"}
              </h1>
              <p
                style={{
                  marginTop: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Angemeldet als {user.email}
              </p>
            </div>
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">
                <IconLogout size={18} stroke={1.75} aria-hidden />
                Abmelden
              </button>
            </form>
          </div>

          {isAdmin && menu ? (
            <MenuAdmin menu={menu} area={area} />
          ) : (
            <p
              style={{
                marginTop: "var(--space-6)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-lg)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Dein Konto ist nicht zur Verwaltung berechtigt. Wende dich an den
              Betreiber, wenn das ein Fehler ist.
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
