import { createClient } from "@/utils/supabase/server";

/**
 * Loader für den Catering-Posteingang (Admin). Liest über die eingeloggte Sitzung;
 * RLS (`catering_requests_admin_read`) gibt die Zeilen nur Admins frei.
 */

export type CateringStatus = "neu" | "erledigt";

export type CateringRequest = {
  id: string;
  name: string;
  email: string;
  occasion: string | null;
  guests: number | null;
  eventDate: string | null;
  message: string | null;
  status: CateringStatus;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  email: string;
  occasion: string | null;
  guests: number | null;
  event_date: string | null;
  message: string | null;
  status: CateringStatus;
  created_at: string;
};

export async function getCateringRequests(): Promise<CateringRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catering_requests")
    .select("id, name, email, occasion, guests, event_date, message, status, created_at")
    // Neue zuerst, innerhalb dessen die jüngsten oben.
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    occasion: r.occasion,
    guests: r.guests,
    eventDate: r.event_date,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  }));
}
