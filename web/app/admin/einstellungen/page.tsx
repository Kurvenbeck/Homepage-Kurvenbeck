import { redirect } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import { getSiteSettingsForAdmin } from "@/lib/getSiteSettings";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function SettingsPage() {
  const supabase = await createClient();

  // Wie /admin: Middleware prüft eingeloggt; hier zusätzlich die Admin-Allowlist.
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
  const initial = isAdmin
    ? await getSiteSettingsForAdmin()
    : { phoneDisplay: "", phoneE164: "", email: "", address: "" };

  return (
    <>
      <SiteHeader logoSuffix="Admin" />

      <section className="section">
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
                {isAdmin ? "Einstellungen" : "Kein Zugriff"}
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

          {isAdmin ? (
            <>
              <AdminNav active="settings" />
              <p
                style={{
                  margin: "var(--space-4) 0 var(--space-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-lg)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Telefon und Adresse für Footer, „Tisch reservieren" und WhatsApp.
                Änderungen sind sofort live.
              </p>
              <SettingsAdmin initial={initial} />
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

      <SiteFooter />
    </>
  );
}
