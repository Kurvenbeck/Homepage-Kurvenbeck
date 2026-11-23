"use client";

import { useState } from "react";
import {
  IconAward,
  IconBread,
  IconCalendarWeek,
  IconChartLine,
  IconCoin,
  IconLayoutDashboard,
  IconSparkles,
} from "@tabler/icons-react";
import type { AuswertungData } from "@/lib/getAuswertung";
import { ItemsTab, OverviewTab, SoonTab, TrendTab } from "./liveTabs";

type TabId = "overview" | "items" | "trend" | "money" | "calendar" | "outlook" | "year";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Überblick", icon: <IconLayoutDashboard size={18} aria-hidden /> },
  { id: "items", label: "Backwaren", icon: <IconBread size={18} aria-hidden /> },
  { id: "trend", label: "Verlauf", icon: <IconChartLine size={18} aria-hidden /> },
  { id: "money", label: "Geld", icon: <IconCoin size={18} aria-hidden /> },
  { id: "calendar", label: "Kalender", icon: <IconCalendarWeek size={18} aria-hidden /> },
  { id: "outlook", label: "Vorausschau", icon: <IconSparkles size={18} aria-hidden /> },
  { id: "year", label: "Jahresrückblick", icon: <IconAward size={18} aria-hidden /> },
];

/** Auswertung mit echten Daten. Fertige Bereiche sind gefüllt, die übrigen zeigen, was kommt und was dafür fehlt. */
export function LiveDashboard({ data }: { data: AuswertungData }) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="ausw">
      <div className="ausw-bar">
        <div className="ausw-tabs" role="tablist" aria-label="Auswertungs-Bereiche">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="ausw-panel"
              className={`ausw-tab${tab === t.id ? " is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div id="ausw-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="ausw-panel">
        {tab === "overview" && <OverviewTab data={data} />}
        {tab === "items" && <ItemsTab data={data} />}
        {tab === "trend" && <TrendTab data={data} />}
        {tab === "money" && (
          <SoonTab
            title="Geld: Rohertrag und Zutatenkosten"
            icon={<IconCoin size={20} aria-hidden />}
            what={[
              "Was dir nach Zutaten von jedem Backtag bleibt (Rohertrag).",
              "Gewinn pro Stück je Backware und welche Zutat am meisten Geld kostet.",
              "Einkaufskosten pro Monat.",
            ]}
            needs="Einkaufspreis je Zutat. Dafür kommt ein Feld „Preis“ bei den Zutaten im Admin."
          />
        )}
        {tab === "calendar" && (
          <SoonTab
            title="Kalender: Wochenlast und Catering"
            icon={<IconCalendarWeek size={20} aria-hidden />}
            what={[
              "Vier Wochen voraus: Backtage, Öffnungstage und Catering-Termine auf einen Blick.",
              "Warnung, wenn sich zwei große Termine am selben Tag überschneiden.",
            ]}
            needs="Ein Status „in Klärung / zugesagt“ bei Catering-Anfragen, damit die Planung zuverlässig ist."
          />
        )}
        {tab === "outlook" && (
          <SoonTab
            title="Vorausschau: Wetter und Was-wäre-wenn"
            icon={<IconSparkles size={20} aria-hidden />}
            what={[
              "Wie das Wetter Biergarten und Backstube beeinflusst.",
              "Prognose für den nächsten Backtag aus dem bisherigen Verlauf.",
              "Was-wäre-wenn-Rechner: Was passiert bei einer Preisänderung?",
            ]}
            needs="Wetterdaten, eine eigene Zahl „Gäste im Biergarten“ pro Öffnungstag und die Preis-Historie."
          />
        )}
        {tab === "year" && (
          <SoonTab
            title="Jahresrückblick"
            icon={<IconAward size={20} aria-hidden />}
            what={[
              "Dein Backjahr in Zahlen: Umsatz, Stückzahlen, stärkster Monat, Lieblings-Backware.",
              "Fun Facts, zum Beispiel wie viele Brezeln es insgesamt waren.",
            ]}
            needs="Ein volles Jahr Daten. Die Zahlen sammeln sich seit dem 20.11.2026."
          />
        )}
      </div>
    </div>
  );
}
