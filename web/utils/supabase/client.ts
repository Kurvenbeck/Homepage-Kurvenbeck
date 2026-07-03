import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-Client für Browser/Client-Komponenten.
 * Nutzt den öffentlichen Publishable-Key (unkritisch); die eigentliche
 * Absicherung übernehmen die RLS-Policies in der Datenbank.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
