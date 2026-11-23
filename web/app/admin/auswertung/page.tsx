import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import { getAuswertung } from "@/lib/getAuswertung";
import { LiveDashboard } from "@/components/admin/auswertung/LiveDashboard";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooterServer } from "@/components/SiteFooterServer";

export const metadata: Metadata = { title: "Auswertung", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AuswertungPage() {
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
  const data = isAdmin ? await getAuswertung() : null;

  return (
    <>
      <SiteHeader logoSuffix="Admin" />
      <section className="section ausw-section">
        <div className="container ausw-container">
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
                {isAdmin ? "Auswertung" : "Kein Zugriff"}
              </h1>
              <p className="admin-intro" style={{ marginTop: "var(--space-2)" }}>
                {isAdmin ? "So lief deine Backstube — verständlich auf einen Blick." : `Angemeldet als ${user.email}`}
              </p>
            </div>
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">
                <IconLogout size={18} aria-hidden /> Abmelden
              </button>
            </form>
          </div>
          {isAdmin ? <AdminNav active="evaluation" /> : null}
          {data ? <LiveDashboard data={data} /> : null}
        </div>
      </section>
      <SiteFooterServer />
    </>
  );
}
