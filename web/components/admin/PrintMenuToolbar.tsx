"use client";

import Link from "next/link";
import { IconPrinter, IconArrowLeft } from "@tabler/icons-react";

/**
 * Bildschirm-Leiste über der Druck-Speisekarte (wird beim Drucken ausgeblendet).
 * „Drucken" öffnet den Browser-Dialog → drucken oder „Als PDF sichern".
 */
export function PrintMenuToolbar() {
  return (
    <div className="print-toolbar no-print">
      <Link href="/admin" className="btn btn-ghost">
        <IconArrowLeft size={18} stroke={1.75} aria-hidden />
        Zurück zur Verwaltung
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        <IconPrinter size={18} stroke={1.75} aria-hidden />
        Speisekarte drucken
      </button>
    </div>
  );
}
