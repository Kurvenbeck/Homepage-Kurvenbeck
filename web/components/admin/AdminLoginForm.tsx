"use client";

import { useEffect, useState } from "react";
import { IconMail } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { SiteContact } from "@/lib/siteSettings";

type Status = "idle" | "sending" | "sent" | "error";

export function AdminLoginForm({ contact }: { contact: SiteContact }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Ungültiger/abgelaufener Link → Hinweis aus der Confirm-Route anzeigen.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("fehler") === "link") {
      setStatus("error");
      setMessage(
        "Der Anmelde-Link war ungültig oder abgelaufen. Fordere unten einen neuen an.",
      );
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Keine Selbstregistrierung: nur bestehende Konten bekommen einen Link.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(
        "Das hat leider nicht geklappt. Prüf deine E-Mail-Adresse und versuch es gleich nochmal.",
      );
      return;
    }

    setStatus("sent");
  }

  return (
    <>
      <SiteHeader logoSuffix="Admin" />

      <section className="section">
        <div className="container" style={{ maxWidth: "34rem" }}>
          <p className="eyebrow">Verwaltung</p>
          <h1 style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-3)" }}>
            Anmelden
          </h1>

          {status === "sent" ? (
            <p
              style={{
                marginTop: "var(--space-6)",
                fontSize: "var(--text-lg)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Wir haben dir einen Anmelde-Link an <strong>{email}</strong>{" "}
              geschickt. Öffne die E-Mail und klick auf den Link, um dich
              anzumelden. Du kannst dieses Fenster dann schließen.
            </p>
          ) : (
            <>
              <p
                style={{
                  marginTop: "var(--space-4)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-lg)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Gib deine E-Mail-Adresse ein — wir schicken dir einen Link, mit
                dem du dich ohne Passwort anmeldest.
              </p>

              <form onSubmit={handleSubmit} style={{ marginTop: "var(--space-8)" }}>
                <div className="field">
                  <label htmlFor="email">E-Mail-Adresse</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="du@beispiel.de"
                  />
                </div>

                {status === "error" && (
                  <p
                    className="field-error"
                    style={{ marginBottom: "var(--space-4)" }}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status === "sending"}
                >
                  <IconMail size={18} stroke={1.75} aria-hidden />
                  {status === "sending" ? "Wird gesendet …" : "Anmelde-Link schicken"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <SiteFooter contact={contact} />
    </>
  );
}
