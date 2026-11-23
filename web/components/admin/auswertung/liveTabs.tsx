"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconBread, IconChartBar, IconClock, IconHourglass, IconInfoCircle, IconUsers } from "@tabler/icons-react";
import type { AuswertungData, StatDay } from "@/lib/getAuswertung";
import { avg, eur, eur2, n0, signedPct, sum } from "@/lib/auswertung";
import { ColumnChart, Heatmap, type Col } from "./charts";
import { BarList, Card, DataTable, Insight, Segmented, StatTile } from "./ui";

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
/** Ab so vielen Backtagen sind Muster und Vergleiche halbwegs belastbar. */
const MIN_DAYS = 5;

function dayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
}

const plural = (n: number, one: string, many: string) => `${n0(n)} ${n === 1 ? one : many}`;

function EmptyCard({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <Card title={title} icon={icon}>
      <Insight>
        Hier erscheint die Auswertung nach dem ersten Backtag von selbst. Jede Nacht sichern wir die Zahlen
        anonym, bevor die Bestellungen nach 7 Tagen gelöscht werden.
      </Insight>
    </Card>
  );
}

function FewDataNote({ n }: { n: number }) {
  if (n >= MIN_DAYS) return null;
  return (
    <p className="ausw-card-hint">
      Bisher {plural(n, "Backtag", "Backtage")} in der Auswertung. Ab {MIN_DAYS} Backtagen wird das Bild belastbar.
    </p>
  );
}

/* ---------------- Überblick ---------------- */
export function OverviewTab({ data }: { data: AuswertungData }) {
  const days = data.days;
  if (days.length === 0) {
    return (
      <div className="ausw-stack">
        <EmptyCard title="Noch keine Auswertung" icon={<IconInfoCircle size={20} aria-hidden />} />
        <NextBacktag data={data} />
      </div>
    );
  }

  const last = days[days.length - 1];
  const prev = days.slice(-9, -1);
  const delta = (v: number, f: (d: StatDay) => number) => {
    const ref = avg(prev.map(f));
    return prev.length && ref ? ((v - ref) / ref) * 100 : undefined;
  };
  const basket = (d: StatDay) => (d.orders ? d.revenue / d.orders : 0);
  const rev = delta(last.revenue, (d) => d.revenue);

  const shown = days.slice(-16);
  const cols: Col[] = shown.map((d, i, a) => ({
    key: d.date,
    xLabel: dayLabel(d.date).slice(3),
    value: d.revenue,
    title: dayLabel(d.date),
    lines: [`${eur(d.revenue)} Umsatz`, `${n0(d.orders)} Bestellungen`, `${n0(d.units)} Stück`],
    color: i === a.length - 1 ? "accent" : "neutral",
  }));

  return (
    <div className="ausw-stack">
      <div className="ausw-stats ausw-stats--3">
        <StatTile label={`Umsatz · ${dayLabel(last.date)}`} value={eur(last.revenue)} delta={rev} spark={days.slice(-12).map((d) => d.revenue)} />
        <StatTile label="Bestellungen" value={n0(last.orders)} delta={delta(last.orders, (d) => d.orders)} spark={days.slice(-12).map((d) => d.orders)} />
        <StatTile label="Ø Warenkorb" value={eur2(basket(last))} delta={delta(basket(last), basket)} spark={days.slice(-12).map(basket)} />
      </div>

      <Card
        title="Umsatz pro Backtag"
        hint={`${plural(days.length, "Backtag", "Backtage")} in der Auswertung`}
        icon={<IconChartBar size={20} aria-hidden />}
      >
        <Insight tone="info">
          Der letzte Backtag brachte {eur(last.revenue)}
          {rev !== undefined ? ` — ${signedPct(rev)} zum Schnitt der Backtage davor.` : "."}
        </Insight>
        <ColumnChart data={cols} fmt={eur} avg={shown.length > 1 ? avg(shown.map((d) => d.revenue)) : undefined} avgLabel="Schnitt" ariaLabel="Umsatz je Backtag" yUnit="€" />
        <DataTable
          head={["Backtag", "Umsatz", "Bestellungen", "Stück"]}
          rows={[...shown].reverse().map((d) => [dayLabel(d.date), eur(d.revenue), n0(d.orders), n0(d.units)])}
        />
      </Card>

      <NextBacktag data={data} />
    </div>
  );
}

function NextBacktag({ data }: { data: AuswertungData }) {
  const open = data.next.openOrders;
  return (
    <>
      <Card title="Nächster Backtag" hint="Live aus den offenen Bestellungen">
        <Insight>
          {open === 0
            ? "Aktuell sind keine offenen Bestellungen da."
            : `${plural(open, "offene Bestellung", "offene Bestellungen")}. Das musst du backen:`}
        </Insight>
        {data.next.bakingList.length > 0 ? (
          <BarList
            rows={data.next.bakingList.map((b) => ({ key: b.id, label: b.name, value: b.qty, display: `${n0(b.qty)} Stück` }))}
          />
        ) : null}
      </Card>
      {data.catering.open > 0 ? (
        <Insight tone="warn">
          {data.catering.open} Catering-{data.catering.open === 1 ? "Anfrage wartet" : "Anfragen warten"} auf dich.
        </Insight>
      ) : null}
    </>
  );
}

/* ---------------- Backwaren ---------------- */
type Metric = "qty" | "revenue";
const METRICS: { id: Metric; label: string }[] = [
  { id: "qty", label: "Stück" },
  { id: "revenue", label: "Umsatz" },
];

export function ItemsTab({ data }: { data: AuswertungData }) {
  const [metric, setMetric] = useState<Metric>("qty");
  const days = data.days;

  const names = useMemo(() => new Map(data.items.map((r) => [r.id, r.name])), [data.items]);
  const ranking = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const r of data.items) {
      const e = m.get(r.id) ?? { name: r.name, qty: 0, revenue: 0 };
      e.qty += r.qty;
      e.revenue += r.revenue;
      m.set(r.id, e);
    }
    return [...m.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b[metric] - a[metric]);
  }, [data.items, metric]);

  const pairs = useMemo(() => {
    const m = new Map<string, { a: string; b: string; count: number }>();
    for (const p of data.pairs) {
      const k = `${p.a}|${p.b}`;
      const e = m.get(k) ?? { a: p.a, b: p.b, count: 0 };
      e.count += p.count;
      m.set(k, e);
    }
    const orders = sum(days.map((d) => d.orders)) || 1;
    return [...m.values()]
      .map((p) => ({ ...p, share: (p.count / orders) * 100 }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 6);
  }, [data.pairs, days]);

  if (days.length === 0) return <EmptyCard title="Backwaren im Vergleich" icon={<IconBread size={20} aria-hidden />} />;

  const top = ranking[0];
  const best = pairs[0];

  return (
    <div className="ausw-stack">
      <Card
        title="Welche Backware läuft am besten?"
        hint="Alle ausgewerteten Backtage zusammen"
        icon={<IconBread size={20} aria-hidden />}
        action={<Segmented<Metric> label="Sortieren nach" options={METRICS} value={metric} onChange={setMetric} />}
      >
        {top ? (
          <Insight tone="good">
            {top.name} liegt vorn: {metric === "qty" ? `${n0(top.qty)} Stück` : eur(top.revenue)} in {plural(days.length, "Backtag", "Backtagen")}.
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
        <FewDataNote n={days.length} />
      </Card>

      <Card title="Was wird zusammen bestellt?" hint="Wie oft zwei Backwaren im selben Warenkorb landen." icon={<IconUsers size={20} aria-hidden />}>
        {best ? (
          <>
            <Insight>
              <strong>{names.get(best.a) ?? "?"} + {names.get(best.b) ?? "?"}</strong> landen in {n0(Math.round(best.share))} % der Bestellungen
              zusammen im Warenkorb. Das wäre eine fertige Set-Idee.
            </Insight>
            <BarList
              rows={pairs.map((p) => ({
                key: `${p.a}${p.b}`,
                label: `${names.get(p.a) ?? "?"} + ${names.get(p.b) ?? "?"}`,
                value: p.share,
                display: `${n0(Math.round(p.share))} %`,
                color: "ochre",
              }))}
              max={Math.max(50, ...pairs.map((p) => p.share))}
            />
          </>
        ) : (
          <Insight>Noch keine Bestellung mit mehreren Backwaren in der Auswertung.</Insight>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Verlauf ---------------- */
const HEAT_ROWS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const HEAT_COLS = ["bis 9", "9–12", "12–15", "15–18", "18–21", "ab 21"];
const HEAT_PHRASE = ["vor 9 Uhr", "zwischen 9 und 12 Uhr", "zwischen 12 und 15 Uhr", "zwischen 15 und 18 Uhr", "zwischen 18 und 21 Uhr", "nach 21 Uhr"];

function heatCol(hour: number) {
  if (hour < 9) return 0;
  if (hour >= 21) return 5;
  return Math.floor((hour - 9) / 3) + 1;
}

export function TrendTab({ data }: { data: AuswertungData }) {
  const days = data.days;

  const heat = useMemo(() => {
    const g = HEAT_ROWS.map(() => HEAT_COLS.map(() => 0));
    for (const d of days)
      for (const [k, v] of Object.entries(d.slots)) {
        const [dow, hour] = k.split("_").map(Number);
        g[dow - 1][heatCol(hour)] += v;
      }
    return g;
  }, [days]);

  const lead = useMemo(() => {
    const total = sum(days.map((d) => d.orders)) || 1;
    return Array.from({ length: 8 }, (_, i) => {
      const day = 7 - i; // 7+ Tage vorher … 0 = am Backtag
      const count = sum(days.map((d) => d.leadDays[String(day)] ?? 0));
      return { day, count, share: (count / total) * 100 };
    });
  }, [days]);

  if (days.length === 0) return <EmptyCard title="Verlauf" icon={<IconClock size={20} aria-hidden />} />;

  let pr = 0, pc = 0;
  heat.forEach((row, r) => row.forEach((v, c) => { if (v > heat[pr][pc]) { pr = r; pc = c; } }));
  const peak = heat[pr][pc];
  const peakLead = lead.reduce((a, b) => (b.count > a.count ? b : a));
  const leadLabel = (day: number) => (day === 0 ? "am Tag" : day === 7 ? "7+ Tg." : `${day} Tg.`);
  const leadText = (day: number) =>
    day === 0 ? "am Backtag selbst" : day === 7 ? "mehr als 7 Tage vorher" : `${plural(day, "Tag", "Tage")} vorher`;
  const leadCols: Col[] = lead.map((l) => ({
    key: String(l.day),
    xLabel: leadLabel(l.day),
    value: Math.round(l.share),
    title: leadText(l.day),
    lines: [`${n0(l.count)} Bestellungen`, `${n0(Math.round(l.share))} % aller Bestellungen`],
    color: l.day === peakLead.day ? "accent" : "neutral",
  }));

  return (
    <div className="ausw-stack">
      <Card title="Wann kommen die Bestellungen?" hint="Bestellungen nach Wochentag und Uhrzeit. Dunkler = mehr." icon={<IconClock size={20} aria-hidden />}>
        {peak > 0 ? (
          <Insight>
            Die meisten Bestellungen kamen bisher <strong>{HEAT_ROWS[pr]} {HEAT_PHRASE[pc]}</strong>
            {" "}({plural(peak, "Bestellung", "Bestellungen")}). Ein Post kurz davor erreicht die meisten Leute.
          </Insight>
        ) : null}
        <Heatmap rows={HEAT_ROWS} cols={HEAT_COLS} values={heat} unit="Bestellungen" />
        <FewDataNote n={days.length} />
      </Card>

      <Card title="Wie früh bestellen deine Gäste?" hint="Anteil aller Bestellungen nach Tagen vor dem Backtag." icon={<IconHourglass size={20} aria-hidden />}>
        <Insight>
          Die meisten bestellen <strong>{leadText(peakLead.day)}</strong> ({n0(Math.round(peakLead.share))} % der Bestellungen).
          Plane Einkauf und Teig danach.
        </Insight>
        <ColumnChart data={leadCols} fmt={(v) => `${n0(v)} %`} ariaLabel="Anteil der Bestellungen nach Tagen vor dem Backtag" height={230} labelEvery={1} />
        <FewDataNote n={days.length} />
        <DataTable head={["Vorlauf", "Bestellungen", "Anteil"]} rows={lead.map((l) => [leadText(l.day), n0(l.count), `${n0(Math.round(l.share))} %`])} />
      </Card>
    </div>
  );
}

/* ---------------- Noch nicht verfügbar ---------------- */
export function SoonTab({ title, icon, what, needs }: { title: string; icon: ReactNode; what: string[]; needs: string }) {
  return (
    <Card title={title} hint="Dieser Bereich kommt noch" icon={icon}>
      <Insight tone="info">Hier siehst du bald:</Insight>
      <ul className="ausw-soon-list">
        {what.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="ausw-soon-needs">
        <strong>Dafür fehlt noch:</strong> {needs}
      </p>
    </Card>
  );
}
