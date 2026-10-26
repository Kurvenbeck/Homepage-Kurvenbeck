"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getMenu } from "@/lib/menu";
import { isRateLimited } from "@/lib/rateLimit";
import { getBacktag } from "@/lib/getBacktag";
import { sendMailTo } from "@/lib/mail";
import type { Backtag } from "@/lib/backtag";

/**
 * Server Action für die Backstube-Vorbestellung. Öffentlich aufrufbar (kein
 * Login): schreibt über RLS (`backstube_orders_public_insert`) in Supabase.
 *
 * Wichtig: Namen und Einzelpreise werden **serverseitig autoritativ** aus dem
 * Live-Menü übernommen (Client-Preise werden ignoriert) und als JSONB-Snapshot
 * gespeichert. Bestellt wird immer für den aktuell aktiven Backtag; ist keiner
 * aktiv, wird abgelehnt.
 *
 * Nach dem Speichern geht (nur wenn eine E-Mail angegeben wurde) eine
 * Empfangsbestätigung an den Gast. Bewusst **keine** Admin-Mail pro Bestellung —
 * der Betreiber bekommt stattdessen eine aggregierte Zusammenfassung nach
 * Bestellschluss (siehe Backlisten-Zusammenfassung).
 */

export type OrderResult = { ok: true } | { ok: false; error: string };

export type OrderLineInput = { id: string; qty: number };

type OrderLine = { id: string; name: string; qty: number; unitPrice: number };

const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderBackstubeConfirmationMail(data: {
  name: string;
  lines: OrderLine[];
  total: number;
  backtag: Backtag;
}) {
  const itemRows = data.lines
    .map(
      (l) =>
        `<tr>
          <td style="padding:4px 12px 4px 0;"><strong>${l.qty}×</strong> ${escapeHtml(l.name)}</td>
          <td style="padding:4px 0; text-align:right; white-space:nowrap;">${EUR.format(l.unitPrice * l.qty)}</td>
        </tr>`,
    )
    .join("");
  const pickupDay = data.backtag.dateLabel
    ? `${escapeHtml(data.backtag.dateLabel)}, ${escapeHtml(data.backtag.pickupText)}`
    : escapeHtml(data.backtag.pickupText);
  return `
    <div style="font-family: sans-serif; font-size: 15px; color: #222;">
      <h2 style="margin: 0 0 16px;">Wir haben deine Vorbestellung erhalten</h2>
      <p>Hallo ${escapeHtml(data.name)},</p>
      <p>danke für deine Vorbestellung! Wir backen frisch für dich. Das hast du bestellt:</p>
      <table cellpadding="0" cellspacing="0" style="margin: 8px 0;">
        ${itemRows}
        <tr><td colspan="2" style="border-top:1px solid #ddd; padding-top:8px;"></td></tr>
        <tr>
          <td style="padding-top:4px;"><strong>Summe (Abholung)</strong></td>
          <td style="padding-top:4px; text-align:right;"><strong>${EUR.format(data.total)}</strong></td>
        </tr>
      </table>
      <p style="margin-top:16px;">Abholung: <strong>${pickupDay}</strong>.<br>Bezahlt wird bei der Abholung.</p>
      <p style="margin-top:24px;">Bis bald,<br>dein Kurvenbeck-Team</p>
    </div>
  `;
}

export type OrderInput = {
  name: string;
  email: string;
  phone: string;
  note: string;
  items: OrderLineInput[];
  /** Honeypot: von Menschen leer, von Bots oft ausgefüllt. */
  company: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitBackstubeOrder(
  input: OrderInput,
): Promise<OrderResult> {
  try {
    // Honeypot: ausgefüllt → als Spam verwerfen, aber „Erfolg" vortäuschen.
    if (input.company.trim() !== "") return { ok: true };

    if (await isRateLimited("backstube", 8, 10 * 60 * 1000))
      return {
        ok: false,
        error: "Gerade kommen sehr viele Anfragen. Bitte versuch es in ein paar Minuten noch einmal.",
      };

    const backtag = await getBacktag();
    if (!backtag.active)
      return {
        ok: false,
        error:
          "Aktuell nimmt die Backstube keine Vorbestellungen an. Schau bald wieder vorbei.",
      };

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Bitte gib deinen Namen an." };

    const email = input.email.trim();
    if (email && !EMAIL_RE.test(email))
      return { ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };

    const phone = input.phone.trim();
    const note = input.note.trim().slice(0, 2000);

    // Autoritatives Live-Menü: id → {name, price}. Empfehlungen sind ebenfalls
    // bestellbar, deshalb Kategorien + Empfehlungen zusammenführen.
    const menu = await getMenu("backstube");
    const catalog = new Map(
      [...menu.categories.flatMap((c) => c.items), ...menu.recommendations].map(
        (i) => [i.id, { name: i.name, price: i.priceValue }] as const,
      ),
    );

    const lines: OrderLine[] = [];
    for (const raw of input.items) {
      const product = catalog.get(raw.id);
      if (!product) continue; // nicht mehr verfügbar → still überspringen
      const qty = Math.floor(Number(raw.qty));
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) continue;
      lines.push({ id: raw.id, name: product.name, qty, unitPrice: product.price });
    }

    if (lines.length === 0)
      return {
        ok: false,
        error:
          "Dein Warenkorb ist leer oder die Auswahl ist nicht mehr verfügbar.",
      };

    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

    const supabase = await createClient();
    const { error } = await supabase.from("backstube_orders").insert({
      customer_name: name.slice(0, 200),
      email: email ? email.slice(0, 200) : null,
      phone: phone ? phone.slice(0, 60) : null,
      note: note || null,
      items: lines,
      total: Number(total.toFixed(2)),
      backtag_date: backtag.date,
      backtag_label: backtag.dateLabel,
    });
    if (error) throw error;

    // Admin-Bestellübersicht + Backliste sofort aktuell halten.
    revalidatePath("/admin/bestellungen");

    // Empfangsbestätigung an den Gast — nur wenn eine E-Mail angegeben wurde.
    // Bewusst keine Admin-Mail pro Bestellung (aggregierte Zusammenfassung
    // nach Bestellschluss statt Einzelmeldungen).
    if (email) {
      await sendMailTo({
        to: email,
        subject: "Deine Vorbestellung bei der Kurvenbeck-Backstube",
        html: renderBackstubeConfirmationMail({ name, lines, total, backtag }),
      });
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? "Die Bestellung konnte nicht gespeichert werden. Bitte versuch es später erneut."
          : "Unbekannter Fehler.",
    };
  }
}
