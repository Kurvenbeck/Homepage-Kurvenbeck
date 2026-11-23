"use client";

import { useState } from "react";
import { IconBread, IconChartBar, IconInfoCircle } from "@tabler/icons-react";
import type { AuswertungData } from "@/lib/getAuswertung";
import { avg, eur, eur2, n0, signedPct, sum } from "@/lib/auswertung";
import { ColumnChart, type Col } from "./charts";
import { BarList, Card, DataTable, Insight, Segmented, StatTile } from "./ui";

type Metric = "qty" | "revenue";

const METRICS: { id: Metric; label: string }[] = [
  { id: "qty", label: "Stück" },
  { id: "revenue", label: "Umsatz" },
];

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function dayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
}

/** Auswertung mit echten Daten (Phase 1: Überblick, Umsatz je Backtag, Backwaren). */
export function LiveDashboard({ data }: { data: AuswertungData }) {
  const [metric, setMetric] = useState<Metric>("qty");
  const days = data.days;

  if (days.length === 0) {
    return (
      <div className="ausw">
        <Card title="Noch keine Auswertung" icon={<IconInfoCircle size={20} aria-hidden />}>
          <Insight>
            Die Auswertung füllt sich nach dem ersten Backtag von selbst. Jede Nacht sichern wir die Zahlen
            des Backtags anonym (ohne Namen und Kontaktdaten), bevor die Bestellungen nach 7 Tagen gelöscht
            werden.
          </Insight>
        </Card>
      </div>
    );
  }

  const last = days[days.length - 1];
  const prev = days.slice(-9, -1);
  const delta = (v: number, f: (d: (typeof days)[number]) => number) => {
    const ref = avg(prev.map(f));
    return prev.length && ref ? ((v - ref) / ref) * 100 : undefined;
  };
  const basket = (d: (typeof days)[number]) => (d.orders ? d.revenue / d.orders : 0);

  const cols: Col[] = days.slice(-16).map((d, i, a) => ({
    key: d.date,
    xLabel: dayLabel(d.date).slice(3),
    value: d.revenue,
    title: dayLabel(d.date),
    lines: [`${eur(d.revenue)} Umsatz`, `${n0(d.orders)} Bestellungen`, `${n0(d.units)} Stück`],
    color: i === a.length - 1 ? "accent" : "neutral",
  }));
  const shown = days.slice(-16);
  const avgRev = avg(shown.map((d) => d.revenue));

  const byItem = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const r of data.items) {
    const e = byItem.get(r.id) ?? { name: r.name, qty: 0, revenue: 0 };
    e.qty += r.qty;
    e.revenue += r.revenue;
    byItem.set(r.id, e);
  }
  const ranking = [...byItem.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b[metric] - a[metric]);
  const top = ranking[0];
  const rev = delta(last.revenue, (d) => d.revenue);

  return (
    <div className="ausw ausw-stack">
      <div className="ausw-stats ausw-stats--3">
        <StatTile
          label={`Umsatz · ${dayLabel(last.date)}`}
          value={eur(last.revenue)}
          delta={rev}
          spark={days.slice(-12).map((d) => d.revenue)}
        />
        <StatTile
          label="Bestellungen"
          value={n0(last.orders)}
          delta={delta(last.orders, (d) => d.orders)}
          spark={days.slice(-12).map((d) => d.orders)}
        />
        <StatTile
          label="Ø Warenkorb"
          value={eur2(basket(last))}
          delta={delta(basket(last), basket)}
          spark={days.slice(-12).map(basket)}
        />
      </div>

      <Card
        title="Umsatz pro Backtag"
        hint={`${days.length} ${days.length === 1 ? "Backtag" : "Backtage"} in der Auswertung`}
        icon={<IconChartBar size={20} aria-hidden />}
      >
        <Insight tone="info">
          Der letzte Backtag brachte {eur(last.revenue)}
          {rev !== undefined ? ` — ${signedPct(rev)} zum Schnitt der Backtage davor.` : "."}
        </Insight>
        <ColumnChart data={cols} fmt={eur} avg={avgRev} avgLabel="Schnitt" ariaLabel="Umsatz je Backtag" yUnit="€" />
        <DataTable
          head={["Backtag", "Umsatz", "Bestellungen", "Stück"]}
          rows={[...shown].reverse().map((d) => [dayLabel(d.date), eur(d.revenue), n0(d.orders), n0(d.units)])}
        />
      </Card>

      <Card
        title="Backwaren im Vergleich"
        hint="Alle ausgewerteten Backtage zusammen"
        icon={<IconBread size={20} aria-hidden />}
        action={<Segmented<Metric> label="Sortieren nach" options={METRICS} value={metric} onChange={setMetric} />}
      >
        {top ? (
          <Insight tone="good">
            {top.name} liegt vorn: {metric === "qty" ? `${n0(top.qty)} Stück` : eur(top.revenue)} in{" "}
            {days.length} {days.length === 1 ? "Backtag" : "Backtagen"}.
          </Insight>
        ) : null}
        <BarList
          ranked
          rows={ranking.map((r) => ({
            key: r.id,
            label: r.name,
            value: r[metric],
            display: metric === "qty" ? `${n0(r.qty)} Stück` : eur(r.revenue),
            sub: metric === "qty" ? eur(r.revenue) : `${n0(r.qty)} Stück`,
          }))}
        />
        <p className="ausw-card-hint">
          Gesamt: {n0(sum(ranking.map((r) => r.qty)))} Stück, {eur(sum(ranking.map((r) => r.revenue)))} Umsatz.
        </p>
      </Card>

      <Card title="Nächster Backtag" hint="Live aus den offenen Bestellungen">
        <Insight>
          {data.next.openOrders === 0
            ? "Aktuell sind keine offenen Bestellungen da."
            : `${n0(data.next.openOrders)} offene ${data.next.openOrders === 1 ? "Bestellung" : "Bestellungen"}. Das musst du backen:`}
        </Insight>
        {data.next.bakingList.length > 0 ? (
          <BarList
            rows={data.next.bakingList.map((b) => ({
              key: b.id,
              label: b.name,
              value: b.qty,
              display: `${n0(b.qty)} Stück`,
            }))}
          />
        ) : null}
      </Card>

      {data.catering.open > 0 ? (
        <Insight tone="warn">
          {data.catering.open} Catering-{data.catering.open === 1 ? "Anfrage wartet" : "Anfragen warten"} auf dich.
        </Insight>
      ) : null}
    </div>
  );
}
