import { redirect } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import { getCateringRequests } from "@/lib/catering";
import { CateringInbox } from "@/components/admin/CateringInbox";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

/** Abmelden (Server Action) — verwirft die Sitzung und leitet zum Login. */
async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function CateringInboxPage() {
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
  const requests = isAdmin ? await getCateringRequests() : [];
  const openCount = requests.filter((r) => r.status === "neu").length;

  return (
    <>
      <SiteHeader logoSuffix="Admin" />

      <section className="section">
        <div className="container" style={{ maxWidth: "56rem" }}>
          <div className="admin-header">
            <div>
              <p className="eyebrow">Verwaltung</p>
              <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
                {isAdmin ? "Catering-Anfragen" : "Kein Zugriff"}
              </h1>
              <p
                style={{
                  marginTop: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {isAdmin
                  ? `${openCount} offen · ${requests.length} gesamt`
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

          {isAdmin ? (
            <>
              <AdminNav active="catering" />
              <CateringInbox requests={requests} />
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
