import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Frischt bei jeder Anfrage das Auth-Token auf und schreibt die Cookies in
 * die Antwort. Der Schutz der `/admin`-Routen (Redirect zum Login) kommt in
 * Phase 4 dazu — hier zunächst nur das Session-Refresh.
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

  // Auth-Token auffrischen.
  await supabase.auth.getUser();

  return supabaseResponse;
}
