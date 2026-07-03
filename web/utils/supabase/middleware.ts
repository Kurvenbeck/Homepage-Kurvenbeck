import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Frischt bei jeder Anfrage das Auth-Token auf und schreibt die Cookies in
 * die Antwort. Zusätzlich Route-Schutz: `/admin/*` (außer `/admin/login`) ist
 * ohne eingeloggte Sitzung nicht erreichbar → Redirect zum Login.
 *
 * WICHTIG: Zwischen dem Erstellen des Clients und `getUser()` darf keine
 * eigene Logik laufen, sonst können Sitzungen sporadisch abgemeldet werden.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Auth-Token auffrischen und aktuelle Sitzung ermitteln.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route-Schutz: /admin nur eingeloggt; /admin/login bleibt offen.
  const { pathname } = request.nextUrl;
  const isAdminArea =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login";

  if (isAdminArea && !isLogin && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
