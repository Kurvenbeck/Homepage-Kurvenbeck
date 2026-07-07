import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

async function send(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.warn("[mail] SMTP nicht konfiguriert — Versand übersprungen.");
    return;
  }

  try {
    await t.sendMail({
      from: `"Kurvenbeck Homepage" <${process.env.SMTP_USER}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    });
  } catch (e) {
    console.error("[mail] Versand fehlgeschlagen:", e);
  }
}

/**
 * Verschickt eine Benachrichtigungs-Mail an das Hostinger-Postfach
 * (`kontakt@kurvenbeck.com`) selbst — z. B. bei einer neuen Anfrage. Fehlt die
 * SMTP-Konfiguration oder schlägt der Versand fehl, wird nur geloggt — der
 * aufrufende Vorgang (z. B. Speichern der Anfrage in Supabase) darf davon
 * nicht abhängen.
 */
export async function sendNotificationMail(options: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  await send({ to: process.env.SMTP_USER ?? "", ...options });
}

/**
 * Verschickt eine Mail an einen beliebigen Empfänger (z. B. Bestätigung an
 * einen Gast). Gleiche Fehlertoleranz wie `sendNotificationMail`.
 */
export async function sendMailTo(options: {
  to: string;
  subject: string;
  html: string;
}) {
  await send(options);
}
