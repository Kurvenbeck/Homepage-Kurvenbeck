import { redirect } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import { getBacktagForAdmin } from "@/lib/getBacktag";
import { getBackstubeOrders } from "@/lib/backstubeOrders";
import { BestellungenTabs } from "@/components/admin/BestellungenTabs";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooterServer } from "@/components/SiteFooterServer";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function OrdersAdminPage() {
  const supabase = await createClient();

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
  const [backtag, view] = isAdmin
    ? await Promise.all([getBacktagForAdmin(), getBackstubeOrders()])
    : [null, null];

  return (
    <>
      <SiteHeader logoSuffix="Admin" />

      <section className="section">
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
                {isAdmin ? "Backstube-Bestellungen" : "Kein Zugriff"}
              </h1>
              <p
                style={{
                  marginTop: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {isAdmin && view
                  ? `${view.openCount} offen · ${view.orders.length} gesamt`
                  : `Angemeldet als ${user.email}`}
              </p>
            </div>
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">
                <IconLogout size={18} stroke={1.75} aria-hidden />
                Abmelden
              </button>
            </form>
          </div>

          {isAdmin && backtag && view ? (
            <>
              <AdminNav active="orders" />
              <BestellungenTabs backtag={backtag} view={view} />
            </>
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

      <SiteFooterServer />
    </>
  );
}
