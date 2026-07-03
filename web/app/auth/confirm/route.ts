import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Bestätigt den Magic-Link und legt die Session-Cookies an, dann Redirect nach
 * `/admin`. Unterstützt beide Supabase-Flows:
 *  - token_hash + type  → `verifyOtp` (E-Mail-Template `{{ .TokenHash }}`,
 *    funktioniert auch geräteübergreifend)
 *  - code               → `exchangeCodeForSession` (PKCE, Standard-Template)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Ungültiger oder abgelaufener Link → zurück zum Login mit Hinweis.
  return NextResponse.redirect(new URL("/admin/login?fehler=link", origin));
}
