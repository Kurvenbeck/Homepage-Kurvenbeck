import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase-Client für Server-Komponenten, Server Actions und Route Handler.
 * In Next.js 15 ist `cookies()` asynchron — daher `await`.
 *
 * `setAll` kann aus einer reinen Server-Komponente heraus keine Cookies
 * schreiben; das ist erwartet und wird abgefangen. Das Auffrischen der
 * Auth-Token übernimmt die Middleware (`utils/supabase/middleware.ts`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Aufruf aus einer Server-Komponente — kann ignoriert werden,
            // solange die Middleware die Sitzung auffrischt.
          }
        },
      },
    },
  );
}
