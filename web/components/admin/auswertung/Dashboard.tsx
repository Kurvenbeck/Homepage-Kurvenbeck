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
import { RANGES, type Data, type Range } from "@/lib/auswertung";
import { Segmented } from "./ui";
import { CalendarTab, ItemsTab, MoneyTab, OutlookTab, OverviewTab, TrendTab, YearTab } from "./tabs";

type TabId = "overview" | "items" | "trend" | "money" | "calendar" | "outlook" | "year";

const TABS: { id: TabId; label: string; icon: React.ReactNode; range: boolean }[] = [
  { id: "overview", label: "Überblick", icon: <IconLayoutDashboard size={18} aria-hidden />, range: false },
  { id: "items", label: "Backwaren", icon: <IconBread size={18} aria-hidden />, range: true },
  { id: "trend", label: "Verlauf", icon: <IconChartLine size={18} aria-hidden />, range: true },
  { id: "money", label: "Geld", icon: <IconCoin size={18} aria-hidden />, range: true },
  { id: "calendar", label: "Kalender", icon: <IconCalendarWeek size={18} aria-hidden />, range: false },
  { id: "outlook", label: "Vorausschau", icon: <IconSparkles size={18} aria-hidden />, range: true },
  { id: "year", label: "Jahresrückblick", icon: <IconAward size={18} aria-hidden />, range: false },
];

export function AuswertungDashboard({ data }: { data: Data }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<Range>("13");
  const current = TABS.find((t) => t.id === tab)!;

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
        <div className={`ausw-range${current.range ? "" : " is-hidden"}`} aria-hidden={!current.range}>
          <span className="ausw-range-label">Zeitraum: die letzten …</span>
          <Segmented<Range> label="Zeitraum" options={RANGES} value={range} onChange={setRange} />
        </div>
      </div>

      <div id="ausw-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="ausw-panel">
        {tab === "overview" && <OverviewTab data={data} />}
        {tab === "items" && <ItemsTab data={data} range={range} />}
        {tab === "trend" && <TrendTab data={data} range={range} />}
        {tab === "money" && <MoneyTab data={data} range={range} />}
        {tab === "calendar" && <CalendarTab data={data} />}
        {tab === "outlook" && <OutlookTab data={data} range={range} />}
        {tab === "year" && <YearTab data={data} />}
      </div>
    </div>
  );
}
