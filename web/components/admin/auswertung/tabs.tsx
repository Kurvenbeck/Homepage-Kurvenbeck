"use client";

import { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconAward,
  IconBulb,
  IconCheck,
  IconClock,
  IconCoin,
  IconCloud,
  IconCloudRain,
  IconPrinter,
  IconSun,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import {
  type Backtag,
  type Data,
  type Range,
  type Weather,
  HEAT_COLS,
  HEAT_ROWS,
  MONTHS,
  MONTHS_LONG,
  WEEKDAYS,
  avg,
  currentPrice,
  eur,
  eur2,
  formatAmount,
  ingredientUsage,
  itemCost,
  itemStats,
  n0,
  n1,
  pct,
  signedPct,
  sliceRange,
  sum,
  sumQty,
  weatherLabel,
} from "@/lib/auswertung";
import { ColumnChart, Heatmap, LineChart, type Col } from "./charts";
import {
  BarList,
  Card,
  DataTable,
  Delta,
  Insight,
  SegBar,
  Segmented,
  StatTile,
  type BarRow,
} from "./ui";

type Props = { data: Data; range: Range };

/* =====================================================================
   Überblick
   ===================================================================== */
export function OverviewTab({ data }: { data: Data }) {
  const all = data.backtage;
  const last = all[all.length - 1];
  const prev = all.slice(-9, -1);
  const stats = useMemo(() => itemStats(all.slice(-13), data), [all, data]);

  const kpi = (f: (b: Backtag) => number, avgFn?: (bs: Backtag[]) => number) => {
    const ref = avgFn ? avgFn(prev) : avg(prev.map(f));
    const v = f(last);
    return { v, delta: ref ? ((v - ref) / ref) * 100 : 0 };
  };
  const rev = kpi((b) => b.revenue);
  const ord = kpi((b) => b.orders);
  const basket = kpi((b) => b.revenue / b.orders);
  const pickup = kpi((b) => ((b.orders - b.notPickedUp) / b.orders) * 100);

  const topQty = [...stats].sort((a, b) => b.qty - a.qty)[0];
  const topRev = [...stats].sort((a, b) => b.revenue - a.revenue)[0];
  const topProfit = [...stats].sort((a, b) => b.profit - a.profit)[0];
  const slow = [...stats].filter((s) => s.qty > 0).sort((a, b) => a.qty - b.qty)[0];

  const heatPeak = useMemo(() => {
    let r = 0, c = 0;
    data.heat.forEach((row, ri) => row.forEach((v, ci) => { if (v > data.heat[r][c]) { r = ri; c = ci; } }));
    return { day: HEAT_ROWS[r], col: HEAT_COLS[c] };
  }, [data.heat]);

  const cum = data.leadCum;
  const mid = Math.round(data.next.ordersByDay[3] / (cum[3] / 100));
  const low = Math.round(mid * 0.9);
  const high = Math.round(mid * 1.1);
  const so = data.next.ordersSoFar;
  const nextQty = Object.entries(data.next.qty)
    .map(([id, q]) => ({ item: data.items.find((i) => i.id === id)!, q }))
    .sort((a, b) => b.q - a.q);
  const shop = ingredientUsage(data.next.qty, data).slice(0, 8);
  const days = Math.floor(data.next.hoursLeft / 24);
  const hrs = data.next.hoursLeft % 24;

  return (
    <div className="ausw-stack">
      <Card title="Das fällt dir auf" hint="Vier Hinweise, die wir aus deinen Zahlen für dich herausgesucht haben." icon={<IconBulb size={20} aria-hidden />}>
        <ul className="ausw-notes">
          <li className="ausw-note is-good">
            <IconAward size={22} aria-hidden />
            <div>
              <strong>{topProfit.item.name} bringt dir den meisten Gewinn</strong>
              <p>{eur(topProfit.profit)} Rohertrag in 3 Monaten
                {topProfit.item.id !== topQty.item.id ? ` — mehr als ${topQty.item.name}, die du am häufigsten verkaufst.` : "."}</p>
            </div>
          </li>
          <li className="ausw-note is-warn">
            <IconAlertTriangle size={22} aria-hidden />
            <div>
              <strong>{last.notPickedUp} {last.notPickedUp === 1 ? "Bestellung" : "Bestellungen"} nicht abgeholt</strong>
              <p>Beim letzten Backtag ({last.label}) — das sind rund {eur(Math.round((last.revenue / last.orders) * last.notPickedUp))} Umsatz, der liegen blieb.</p>
            </div>
          </li>
          <li className="ausw-note is-warn">
            <IconTrendingUp size={22} aria-hidden style={{ transform: "scaleY(-1)" }} />
            <div>
              <strong>{slow.item.name} läuft schwach</strong>
              <p>Nur {n0(slow.avgQty)} Stück pro Backtag. Prüfe eine Mindestmenge oder nimm sie testweise raus.</p>
            </div>
          </li>
          <li className="ausw-note">
            <IconClock size={22} aria-hidden />
            <div>
              <strong>Bestellspitze: {heatPeak.day} {heatPeak.col} Uhr</strong>
              <p>Zu dieser Zeit bestellen die meisten. Ein Post kurz davor erreicht am meisten Leute.</p>
            </div>
          </li>
        </ul>
      </Card>

      <div className="ausw-stats">
        <StatTile label={`Umsatz · ${last.label}`} value={eur(rev.v)} delta={rev.delta} spark={all.slice(-12).map((b) => b.revenue)} />
        <StatTile label="Bestellungen" value={n0(ord.v)} delta={ord.delta} spark={all.slice(-12).map((b) => b.orders)} />
        <StatTile label="Ø Warenkorb" value={eur2(basket.v)} delta={basket.delta} spark={all.slice(-12).map((b) => b.revenue / b.orders)} />
        <StatTile label="Abgeholt" value={pct(pickup.v)} delta={pickup.delta} deltaLabel="vs. Schnitt" spark={all.slice(-12).map((b) => ((b.orders - b.notPickedUp) / b.orders) * 100)} />
      </div>

      <Card
        title={`Nächster Backtag · ${data.next.label}`}
        hint="So weit ist die Bestellung für den nächsten Backtag. Das gehört morgens als Erstes auf deinen Tisch."
        icon={<IconClock size={20} aria-hidden />}
        action={
          <button type="button" className="btn btn-ghost">
            <IconPrinter size={18} stroke={1.75} aria-hidden /> Backliste drucken
          </button>
        }
      >
        <div className="ausw-next">
          <div className="ausw-next-main">
            <div className="ausw-countdown">
              <p className="ausw-countdown-num">{days} Tag{days === 1 ? "" : "e"} {hrs} Std</p>
              <p className="ausw-countdown-label">bis Bestellschluss ({data.next.deadlineLabel})</p>
            </div>
            <div className="ausw-forecast">
              <div className="ausw-forecast-head">
                <strong>{so} Bestellungen bisher</strong>
                <span>Prognose: ca. {mid} <em>({low}–{high})</em></span>
              </div>
              <div className="ausw-forecast-track" role="img" aria-label={`${so} von etwa ${mid} erwarteten Bestellungen`}>
                <div className="ausw-forecast-range" style={{ left: `${(low / (high + 4)) * 100}%`, width: `${((high - low) / (high + 4)) * 100}%` }} />
                <div className="ausw-forecast-fill" style={{ width: `${(so / (high + 4)) * 100}%` }} />
                <div className="ausw-forecast-mark" style={{ left: `${(mid / (high + 4)) * 100}%` }} />
              </div>
              <p className="ausw-forecast-note">
                Du liegst {n0(Math.round((mid / avg(all.slice(-13).map((b) => b.orders)) - 1) * 100))} % über dem üblichen Tempo
                — am Schluss kommen erfahrungsgemäß noch {mid - so} Bestellungen dazu.
              </p>
            </div>
          </div>
          <div className="ausw-next-cols">
            <div>
              <h4 className="ausw-subtitle">Was du backen musst</h4>
              <BarList
                rows={nextQty.map((n) => ({ key: n.item.id, label: n.item.name, value: n.q, display: `${n.q}×` }))}
              />
            </div>
            <div>
              <h4 className="ausw-subtitle">Was du einkaufen musst</h4>
              <ul className="ausw-shop">
                {shop.map((s) => (
                  <li key={s.ing.id}>
                    <span>{s.ing.name}</span>
                    <strong>{formatAmount(s.ing, s.amount)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Das lief am besten" hint="Die Siegerin je nach Blickwinkel — letzte 3 Monate." icon={<IconAward size={20} aria-hidden />}>
        <div className="ausw-podium">
          {[
            { k: "Am häufigsten verkauft", s: topQty, v: `${n0(topQty.qty)} Stück` },
            { k: "Höchster Umsatz", s: topRev, v: eur(topRev.revenue) },
            { k: "Größter Gewinn", s: topProfit, v: eur(topProfit.profit) },
          ].map((p) => (
            <div key={p.k} className="ausw-podium-item">
              <p className="ausw-podium-kicker">{p.k}</p>
              <p className="ausw-podium-name">{p.s.item.name}</p>
              <p className="ausw-podium-value">{p.v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =====================================================================
   Backwaren
   ===================================================================== */
type Metric = "qty" | "revenue" | "profit";

export function ItemsTab({ data, range }: Props) {
  const bts = sliceRange(data.backtage, range);
  const [metric, setMetric] = useState<Metric>("qty");
  const stats = useMemo(() => itemStats(bts, data).filter((s) => s.qty > 0), [bts, data]);
  const meanQty = avg(stats.map((s) => s.qty));
  const sorted = [...stats].sort((a, b) => b[metric] - a[metric]);
  const total = sum(stats.map((s) => s[metric]));
  const top = sorted[0];
  const topQty = [...stats].sort((a, b) => b.qty - a.qty)[0];

  const fmtMetric = (s: (typeof stats)[number]) =>
    metric === "qty" ? `${n0(s.qty)} Stück` : eur(s[metric]);
  const rows: BarRow[] = sorted.map((s, i) => ({
    key: s.item.id,
    label: s.item.name,
    value: s[metric],
    display: fmtMetric(s),
    sub: `${eur2(s.price)} pro Stück`,
    badge: s.qty < meanQty * 0.45 && i >= sorted.length - 2 ? { text: "Ladenhüter", tone: "warn" } : undefined,
  }));

  const insight =
    metric === "qty" ? (
      <><strong>{top.item.name}</strong> ist dein Spitzenreiter: {pct((top.qty / total) * 100)} aller verkauften Stücke.</>
    ) : metric === "revenue" ? (
      <><strong>{top.item.name}</strong> bringt dir den meisten Umsatz ({pct((top.revenue / total) * 100)}){top.item.id !== topQty.item.id ? <> — obwohl <strong>{topQty.item.name}</strong> öfter über den Tisch geht.</> : "."}</>
    ) : (
      <><strong>{top.item.name}</strong> macht den größten Gewinn ({eur(top.profit)}, {pct((top.profit / total) * 100)} von allem){top.item.id !== topQty.item.id ? <> — nicht die meistverkaufte Ware.</> : "."}</>
    );

  const byMargin = [...stats].sort((a, b) => b.perPiece - a.perPiece);
  const maxPer = Math.max(...byMargin.map((s) => s.perPiece));

  const vegan = sum(stats.filter((s) => s.item.tag === "vegan").map((s) => s.qty));
  const veggie = sum(stats.filter((s) => s.item.tag === "vegetarisch").map((s) => s.qty));

  const pc = data.priceChange;
  const pcItem = data.items.find((i) => i.id === pc.itemId)!;
  const before = data.backtage.filter((b) => b.date < pc.date).slice(-8);
  const after = data.backtage.filter((b) => b.date >= pc.date);
  // Pro 100 Bestellungen gerechnet → Saison und Wachstum fallen heraus, nur der Preis wirkt.
  const per100 = (bs: Backtag[]) => (sum(bs.map((b) => b.qty[pc.itemId] ?? 0)) / sum(bs.map((b) => b.orders))) * 100;
  const qBefore = per100(before);
  const qAfter = per100(after);
  const rBefore = qBefore * pc.from;
  const rAfter = qAfter * pc.to;
  const dQty = ((qAfter - qBefore) / qBefore) * 100;
  const dRev = ((rAfter - rBefore) / rBefore) * 100;

  return (
    <div className="ausw-stack">
      <Card
        title="Welche Backware läuft am besten?"
        hint="Wähle, was „am besten“ für dich heißt. Der Balken zeigt den Abstand zur Nächsten."
        icon={<IconAward size={20} aria-hidden />}
        action={
          <Segmented<Metric>
            label="Ranking nach"
            value={metric}
            onChange={setMetric}
            options={[
              { id: "qty", label: "Stück" },
              { id: "revenue", label: "Umsatz" },
              { id: "profit", label: "Gewinn" },
            ]}
          />
        }
      >
        <Insight tone="good">{insight}</Insight>
        <BarList rows={rows} ranked />
        <p className="ausw-footnote">„Gewinn“ = Verkaufspreis minus Zutaten aus deinen Rezepten (ohne Strom, Miete, Arbeitszeit).</p>
      </Card>

      <div className="ausw-grid-2">
        <Card title="Wie viel bleibt pro Stück hängen?" hint="Preis minus Zutaten. Je länger der Balken, desto mehr verdienst du pro verkauftem Stück." icon={<IconTrendingUp size={20} aria-hidden />}>
          <Insight>
            <strong>{byMargin[0].item.name}</strong> lässt pro Stück {eur2(byMargin[0].perPiece)} übrig — <strong>{byMargin[byMargin.length - 1].item.name}</strong> nur {eur2(byMargin[byMargin.length - 1].perPiece)}.
          </Insight>
          <div className="ausw-margin" role="table" aria-label="Gewinn pro Stück">
            <div className="ausw-margin-head" role="row">
              <span role="columnheader">Backware</span>
              <span role="columnheader" className="is-num">Preis</span>
              <span role="columnheader" className="is-num">Zutaten</span>
              <span role="columnheader">Gewinn pro Stück</span>
            </div>
            {byMargin.map((s) => (
              <div className="ausw-margin-row" role="row" key={s.item.id}>
                <span role="cell" className="ausw-margin-name">{s.item.name}</span>
                <span role="cell" className="is-num">{eur2(s.price)}</span>
                <span role="cell" className="is-num">{eur2(s.cost)}</span>
                <span role="cell" className="ausw-margin-bar">
                  <span className="ausw-bar-track" aria-hidden>
                    <span className="ausw-bar-fill is-good" style={{ width: `${(s.perPiece / maxPer) * 100}%` }} />
                  </span>
                  <strong>{eur2(s.perPiece)}</strong>
                </span>
              </div>
            ))}
          </div>
          <p className="ausw-tip-note">
            <IconBulb size={18} aria-hidden />
            <span><strong>Tipp:</strong> Waren mit hohem Gewinn pro Stück gehören auf der Speisekarte nach oben — und beim Bestellen ruhig als „Empfehlung“ markiert.</span>
          </p>
        </Card>

        <div className="ausw-stack">
          <Card title="Was wird zusammen bestellt?" hint="Wie oft zwei Backwaren im selben Warenkorb landen." icon={<IconUsers size={20} aria-hidden />}>
            <Insight>
              <strong>{data.pairs[0].a} + {data.pairs[0].b}</strong> gehen in {data.pairs[0].share} % der Bestellungen zusammen raus — eine fertige Set-Idee.
            </Insight>
            <BarList
              rows={data.pairs.map((p) => ({
                key: p.a + p.b,
                label: `${p.a} + ${p.b}`,
                value: p.share,
                display: `${p.share} %`,
                color: "ochre",
              }))}
              max={50}
            />
          </Card>

          <Card title="Wer isst was?" hint="Anteil an allen verkauften Stücken." icon={<IconUsers size={20} aria-hidden />}>
            <Insight>
              {pct((vegan / (vegan + veggie)) * 100)} deiner Backwaren sind vegan — ein Argument für dein Marketing.
            </Insight>
            <SegBar
              parts={[
                { key: "vegan", label: "vegan", value: vegan, color: "good" },
                { key: "veg", label: "vegetarisch", value: veggie, color: "ochre" },
              ]}
              unit=" Stück"
            />
          </Card>
        </div>
      </div>

      <Card title="Hat die Preiserhöhung geschadet?" hint="Vergleich pro 100 Bestellungen: 8 Backtage vor und alle Backtage nach der Änderung. So spielen Jahreszeit und Wachstum keine Rolle." icon={<IconTrendingUp size={20} aria-hidden />}>
        <Insight tone={dRev >= 0 ? "good" : "warn"}>
          <strong>{pcItem.name}</strong> kostet seit dem {pc.date.slice(8, 10)}.{pc.date.slice(5, 7)}. {eur2(pc.to)} statt {eur2(pc.from)}. Bei gleicher Bestellmenge werden {Math.abs(Math.round(dQty))} % {dQty < 0 ? "weniger" : "mehr"} verkauft, der Umsatz {dRev >= 0 ? "steigt" : "sinkt"} aber um {Math.abs(Math.round(dRev))} % — {dRev >= 0 ? "die Kundschaft trägt den Preis mit." : "der Preis drückt den Absatz."}
        </Insight>
        <div className="ausw-before-after">
          <div>
            <p className="ausw-ba-label">Davor</p>
            <p className="ausw-ba-big">{n1(qBefore)} Stück</p>
            <p className="ausw-ba-sub">pro 100 Bestellungen · {eur(rBefore)} Umsatz</p>
          </div>
          <div className="ausw-ba-arrow" aria-hidden>→</div>
          <div>
            <p className="ausw-ba-label">Danach</p>
            <p className="ausw-ba-big">{n1(qAfter)} Stück</p>
            <p className="ausw-ba-sub">pro 100 Bestellungen · {eur(rAfter)} Umsatz</p>
          </div>
          <div className="ausw-ba-delta">
            <Delta value={dRev} label="Umsatz" />
            <Delta value={dQty} label="Absatz" goodWhenUp />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =====================================================================
   Verlauf
   ===================================================================== */
export function TrendTab({ data, range }: Props) {
  const bts = sliceRange(data.backtage, range);
  const last = bts[bts.length - 1];
  const mean = avg(bts.map((b) => b.revenue));
  const best = bts.reduce((a, b) => (b.revenue > a.revenue ? b : a), bts[0]);
  const dLast = ((last.revenue - mean) / mean) * 100;

  const cols: Col[] = bts.map((b, i) => ({
    key: b.date,
    xLabel: b.short.replace(/\.$/, ""),
    value: b.revenue,
    color: i === bts.length - 1 ? "accent" : "neutral",
    title: b.label,
    lines: [`Umsatz: ${eur(b.revenue)}`, `${b.orders} Bestellungen · Ø ${eur2(b.revenue / b.orders)}`],
  }));

  const byMonth = useMemo(() => {
    const m: { month: number; revs: number[] }[] = [];
    for (const b of data.backtage) {
      let e = m.find((x) => x.month === b.month);
      if (!e) m.push((e = { month: b.month, revs: [] }));
      e.revs.push(b.revenue);
    }
    return m.map((e) => ({ month: e.month, avg: avg(e.revs), n: e.revs.length }));
  }, [data.backtage]);
  const bestMonth = byMonth.reduce((a, b) => (b.avg > a.avg ? b : a));
  const worstMonth = byMonth.reduce((a, b) => (b.avg < a.avg ? b : a));
  const monthCols: Col[] = byMonth.map((m) => ({
    key: String(m.month),
    xLabel: MONTHS[m.month],
    value: Math.round(m.avg),
    color: m === bestMonth ? "accent" : "neutral",
    title: MONTHS_LONG[m.month],
    lines: [`Ø ${eur(m.avg)} pro Backtag`, `${m.n} Backtag${m.n === 1 ? "" : "e"}`],
  }));

  const sa = data.backtage.filter((b) => b.weekday === 6);
  const fr = data.backtage.filter((b) => b.weekday === 5);

  const cum = data.leadCum;
  const avgOrders = avg(data.backtage.slice(-13).map((b) => b.orders));
  const schnitt = cum.map((c) => Math.round((avgOrders * c) / 100));
  const cur = data.next.ordersByDay;
  const forecast = Math.round(cur[3] / (cum[3] / 100));
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr"];
  const ahead = (cur[3] / schnitt[3] - 1) * 100;

  const heatScale = sum(bts.map((b) => b.orders)) / sum(data.heat.flat());
  const heat = data.heat.map((r) => r.map((v) => Math.round(v * heatScale)));
  let pr = 0, pc = 0;
  heat.forEach((row, r) => row.forEach((v, c) => { if (v > heat[pr][pc]) { pr = r; pc = c; } }));

  return (
    <div className="ausw-stack">
      <Card title="Umsatz pro Backtag" hint="Jeder Balken ist ein Backtag. Die Linie ist dein Schnitt." icon={<IconTrendingUp size={20} aria-hidden />}>
        <Insight tone={dLast >= 0 ? "good" : "warn"}>
          Der letzte Backtag ({last.label}) brachte <strong>{eur(last.revenue)}</strong> — <strong>{signedPct(dLast)}</strong> zum Schnitt von {eur(mean)}. Dein Rekord im Zeitraum: {best.label} mit {eur(best.revenue)}.
        </Insight>
        <ColumnChart
          data={cols}
          fmt={eur}
          avg={mean}
          avgLabel={`Schnitt ${eur(mean)}`}
          ariaLabel="Umsatz pro Backtag als Säulendiagramm"
        />
        <DataTable head={["Backtag", "Umsatz", "Bestellungen"]} rows={bts.map((b) => [b.label, eur(b.revenue), b.orders])} />
      </Card>

      <div className="ausw-grid-2">
        <Card title="Welche Jahreszeit läuft gut?" hint="Durchschnittlicher Umsatz pro Backtag, je Monat." icon={<IconTrendingUp size={20} aria-hidden />}>
          <Insight>
            Am besten läuft der <strong>{MONTHS_LONG[bestMonth.month]}</strong> (Ø {eur(bestMonth.avg)}), am ruhigsten der {MONTHS_LONG[worstMonth.month]} (Ø {eur(worstMonth.avg)}).
          </Insight>
          <ColumnChart data={monthCols} fmt={eur} ariaLabel="Durchschnittlicher Umsatz pro Backtag je Monat" height={230} labelEvery={1} />
          <div className="ausw-duo">
            <div>
              <p className="ausw-duo-label">Samstags-Backtage</p>
              <p className="ausw-duo-value">Ø {eur(avg(sa.map((b) => b.revenue)))}</p>
              <p className="ausw-duo-sub">{sa.length} Backtage</p>
            </div>
            <div>
              <p className="ausw-duo-label">Freitags-Backtage</p>
              <p className="ausw-duo-value">Ø {eur(avg(fr.map((b) => b.revenue)))}</p>
              <p className="ausw-duo-sub">{fr.length} Backtage{fr.length < 5 ? " – noch wenig Daten" : ""}</p>
            </div>
          </div>
        </Card>

        <Card title="Wann kommen die Bestellungen?" hint="Bestellungen insgesamt, nach Wochentag und Uhrzeit. Dunkler = mehr." icon={<IconClock size={20} aria-hidden />}>
          <Insight>
            Die meisten Bestellungen kommen <strong>{HEAT_ROWS[pr]} zwischen {HEAT_COLS[pc]} Uhr</strong>. Ein Post kurz davor erreicht die meisten.
          </Insight>
          <Heatmap rows={HEAT_ROWS} cols={HEAT_COLS} values={heat} unit="Bestellungen" />
        </Card>
      </div>

      <Card title="Wie schnell füllt sich ein Backtag?" hint="Bestellungen von Sonntag bis Bestellschluss am Freitag, im Vergleich zum üblichen Verlauf." icon={<IconClock size={20} aria-hidden />}>
        <Insight tone="good">
          Der nächste Backtag liegt <strong>{n0(ahead)} % vor dem üblichen Tempo</strong>. Daraus rechnen wir etwa <strong>{forecast} Bestellungen</strong> bis Freitag 18 Uhr.
        </Insight>
        <LineChart
          xLabels={days}
          ariaLabel="Bestellungen im Verlauf der Woche bis zum Bestellschluss"
          fmt={(v) => `${n0(v)} Bestellungen`}
          series={[
            { key: "avg", name: "Üblicher Verlauf", short: "Üblich", color: "neutral", values: schnitt, area: true },
            { key: "cur", name: "Nächster Backtag", short: "Jetzt", color: "accent", values: [...cur, null, null] },
            { key: "fc", name: "Prognose", short: "Prognose", color: "accent", dashed: true, values: [null, null, null, cur[3], Math.round((cur[3] + forecast) / 2), forecast] },
          ]}
        />
        <DataTable head={["Tag (Ende)", "Üblich", "Nächster Backtag"]} rows={days.map((d, i) => [d, schnitt[i], cur[i] ?? "–"])} />
      </Card>
    </div>
  );
}

/* =====================================================================
   Geld
   ===================================================================== */
export function MoneyTab({ data, range }: Props) {
  const bts = sliceRange(data.backtage, range);
  const revenue = sum(bts.map((b) => b.revenue));
  const cost = sum(bts.map((b) => b.cost));
  const profit = revenue - cost;
  const usage = useMemo(() => ingredientUsage(sumQty(bts), data), [bts, data]);
  const maxCost = Math.max(...usage.map((u) => u.cost), 1);

  const n = range === "all" ? 0 : Number(range);
  const prev = n ? data.backtage.slice(-2 * n, -n) : [];
  const hasPrev = prev.length === n && n > 0;
  const pRev = sum(prev.map((b) => b.revenue));
  const pCost = sum(prev.map((b) => b.cost));
  const d = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

  const byMonth = useMemo(() => {
    const m = new Map<number, { v: number; n: number }>();
    for (const b of data.backtage) {
      const e = m.get(b.month) ?? { v: 0, n: 0 };
      e.v += b.cost;
      e.n += 1;
      m.set(b.month, e);
    }
    return [...m.entries()].map(([month, e]) => ({ month, v: e.v, n: e.n }));
  }, [data.backtage]);
  const maxMonth = byMonth.reduce((a, b) => (b.v > a.v ? b : a));
  const cols: Col[] = byMonth.map((m) => ({
    key: String(m.month),
    xLabel: MONTHS[m.month],
    value: Math.round(m.v),
    color: m === maxMonth ? "ochre" : "neutral",
    title: MONTHS_LONG[m.month],
    lines: [`Zutaten: ${eur(m.v)}`, `${m.n} Backtag${m.n === 1 ? "" : "e"}`],
  }));

  return (
    <div className="ausw-stack">
      <div className="ausw-stats ausw-stats--3">
        <StatTile label="Umsatz" value={eur(revenue)} note={`${bts.length} Backtage`} delta={hasPrev ? d(revenue, pRev) : undefined} deltaLabel="vs. davor" />
        <StatTile label="Zutaten (Einkauf)" value={eur(cost)} note={`${pct((cost / revenue) * 100)} vom Umsatz`} delta={hasPrev ? d(cost, pCost) : undefined} deltaLabel="vs. davor" goodWhenUp={false} />
        <StatTile label="Rohertrag" value={eur(profit)} note={`${pct((profit / revenue) * 100)} bleiben übrig`} delta={hasPrev ? d(profit, pRev - pCost) : undefined} deltaLabel="vs. davor" />
      </div>
      <p className="ausw-footnote ausw-footnote--lone">Rohertrag = Umsatz minus Zutaten. Strom, Miete und Arbeitszeit sind nicht eingerechnet.{hasPrev ? ` „Davor“ = die ${n} Backtage vorher.` : ""}</p>

      <div className="ausw-grid-2">
        <Card title="Wohin geht dein Einkaufsgeld?" hint="Kosten je Zutat im gewählten Zeitraum." icon={<IconTrendingUp size={20} aria-hidden />}>
          <Insight>
            <strong>{usage[0].ing.name}</strong> ist mit {eur(usage[0].cost)} dein größter Posten ({pct((usage[0].cost / cost) * 100)} aller Zutaten-Kosten) — hier lohnt sich ein Preisvergleich.
          </Insight>
          <BarList
            rows={usage.slice(0, 8).map((u, i) => ({
              key: u.ing.id,
              label: u.ing.name,
              value: u.cost,
              display: eur(u.cost),
              sub: formatAmount(u.ing, u.amount),
              color: i === 0 ? "ochre" : "neutral",
            }))}
            max={maxCost}
          />
        </Card>
        <div className="ausw-stack">
          <Card title="Was kostet dich ein Backtag?" hint="Durchschnitt pro Backtag im gewählten Zeitraum." icon={<IconCoin size={20} aria-hidden />}>
            <Insight tone="good">
              Von jedem Euro Umsatz gehen <strong>{n0((cost / revenue) * 100)} Cent</strong> für Zutaten drauf — <strong>{n0((profit / revenue) * 100)} Cent</strong> bleiben übrig.
            </Insight>
            <div className="ausw-duo">
              <div>
                <p className="ausw-duo-label">Zutaten pro Backtag</p>
                <p className="ausw-duo-value">Ø {eur(cost / bts.length)}</p>
              </div>
              <div>
                <p className="ausw-duo-label">Rohertrag pro Backtag</p>
                <p className="ausw-duo-value">Ø {eur(profit / bts.length)}</p>
              </div>
            </div>
          </Card>
          <Card title="Einkaufskosten pro Monat" hint="Was die Zutaten für alle Backtage eines Monats zusammen kosten." icon={<IconTrendingUp size={20} aria-hidden />}>
            <Insight>
              Im <strong>{MONTHS_LONG[maxMonth.month]}</strong> gibst du am meisten aus: {eur(maxMonth.v)} (an {maxMonth.n} Backtagen). Der laufende Monat ist noch nicht voll.
            </Insight>
            <ColumnChart data={cols} fmt={eur} ariaLabel="Zutaten-Kosten pro Monat" height={210} labelEvery={1} />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   Kalender
   ===================================================================== */
const LOAD = (guests: number) => Math.ceil(guests / 10);

export function CalendarTab({ data }: { data: Data }) {
  const weeks = data.calendar.map((w) => {
    const chips = w.days.flatMap((d) => d.chips);
    const load = sum(chips.map((c) => (c.kind === "backtag" ? 2 : c.kind === "biergarten" ? 1 : LOAD(c.guests ?? 0))));
    const level = load <= 5 ? "leicht" : load <= 9 ? "mittel" : "hoch";
    const clash = w.days.filter((d) => d.chips.some((c) => c.kind === "backtag") && d.chips.some((c) => c.kind === "catering"));
    return { ...w, load, level, clash };
  });
  const clashWeeks = weeks.filter((w) => w.clash.length);
  const p = data.catering.pipeline;
  const open = p.neu + p.klaerung;

  return (
    <div className="ausw-stack">
      <Card title="Die nächsten 4 Wochen" hint="Backtage, Biergarten und Catering in einer Ansicht. So siehst du früh, wann es eng wird." icon={<IconClock size={20} aria-hidden />}>
        {clashWeeks.length ? (
          <Insight tone="warn">
            <strong>Achtung:</strong> in KW {clashWeeks.map((w) => w.kw).join(" und KW ")} fallen Backtag und Catering auf denselben Tag. Plane Ofen und Personal ein — oder verschiebe den Backtag.
          </Insight>
        ) : (
          <Insight tone="good">Keine Überschneidungen in den nächsten 4 Wochen.</Insight>
        )}
        <div className="ausw-cal" role="table" aria-label="Wochenkalender">
          <div className="ausw-cal-head" role="row">
            <span role="columnheader">Woche</span>
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <span role="columnheader" key={d}>{d}</span>)}
          </div>
          {weeks.map((w) => (
            <div className="ausw-cal-week" role="row" key={w.kw}>
              <div className="ausw-cal-wk" role="rowheader">
                <strong>KW {w.kw}</strong>
                <span>{w.range}</span>
                <span className={`ausw-load is-${w.level}`}>Auslastung {w.level}</span>
              </div>
              {w.days.map((d) => {
                const clash = w.clash.includes(d);
                return (
                  <div key={d.date} role="cell" className={`ausw-cal-day${d.date === data.now ? " is-today" : ""}${clash ? " is-clash" : ""}`}>
                    <span className="ausw-cal-num">{d.day}{d.date === data.now ? <em>heute</em> : null}</span>
                    {d.chips.map((c) => (
                      <span key={c.kind} className={`ausw-chip is-${c.kind}`}>
                        <b>{c.text}</b>
                        {c.sub ? <small>{c.sub}</small> : null}
                      </span>
                    ))}
                    {clash ? <span className="ausw-clash"><IconAlertTriangle size={14} aria-hidden /> Überschneidung</span> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ul className="ausw-legend ausw-legend--chart">
          <li><i className="ausw-swatch is-accent" aria-hidden />Backtag</li>
          <li><i className="ausw-swatch is-good" aria-hidden />Biergarten</li>
          <li><i className="ausw-swatch is-ochre" aria-hidden />Catering</li>
        </ul>
      </Card>

      <div className="ausw-grid-2">
        <Card title="Catering-Anfragen" hint="Wo stehen deine Anfragen gerade?" icon={<IconUsers size={20} aria-hidden />}>
          <Insight tone={open ? "warn" : "good"}>
            <strong>{open} Anfragen warten auf dich</strong> ({p.neu} neu, {p.klaerung} in Klärung). Deine Antwortzeit liegt im Schnitt bei {data.catering.avgReplyHours} Stunden.
          </Insight>
          <SegBar
            parts={[
              { key: "neu", label: "Neu", value: p.neu, color: "accent" },
              { key: "kl", label: "In Klärung", value: p.klaerung, color: "ochre" },
              { key: "zu", label: "Zugesagt", value: p.zugesagt, color: "good" },
              { key: "ab", label: "Abgesagt", value: p.abgesagt, color: "neutral" },
            ]}
          />
          <h4 className="ausw-subtitle" style={{ marginTop: "var(--space-6)" }}>Anfragen pro Monat</h4>
          <ColumnChart
            data={data.catering.perMonth.map((m, i, a) => ({
              key: m.label, xLabel: m.label, value: m.value, title: m.label, lines: [`${m.value} Anfragen`],
              color: i === a.length - 1 ? "accent" : "neutral",
            }))}
            fmt={(v) => n0(v)}
            ariaLabel="Catering-Anfragen pro Monat"
            height={190}
            labelEvery={1}
          />
        </Card>

        <Card title="Anstehende Veranstaltungen" hint="Die nächsten Catering-Termine nach Datum." icon={<IconUsers size={20} aria-hidden />}>
          <ul className="ausw-events">
            {data.catering.upcoming.map((e) => (
              <li key={e.date}>
                <span className="ausw-events-date">{e.label}</span>
                <span className="ausw-events-main">
                  <strong>{e.type}</strong>
                  <span>{e.guests} Gäste</span>
                </span>
                <span className={`ausw-badge is-${e.status === "zugesagt" ? "good" : e.status === "neu" ? "accent" : "warn"}`}>
                  {e.status === "zugesagt" ? "Zugesagt" : e.status === "neu" ? "Neu" : "In Klärung"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* =====================================================================
   Vorausschau: Wetter + Rechner
   ===================================================================== */
const WX_ICON: Record<Weather, React.ReactNode> = {
  sonnig: <IconSun size={22} aria-hidden />,
  wechselhaft: <IconCloud size={22} aria-hidden />,
  regen: <IconCloudRain size={22} aria-hidden />,
};

export function OutlookTab({ data, range }: Props) {
  void range;
  const wx: Weather[] = ["sonnig", "wechselhaft", "regen"];
  const guestRows: BarRow[] = wx.map((w): BarRow => {
    const g = data.biergarten.filter((b) => b.weather === w);
    return { key: w, label: weatherLabel[w], value: avg(g.map((x) => x.guests)), display: `${n0(avg(g.map((x) => x.guests)))} Gäste`, sub: `${g.length} Öffnungstage`, color: w === "sonnig" ? "accent" : "neutral" };
  });
  const orderRows: BarRow[] = wx.map((w): BarRow => {
    const g = data.backtage.filter((b) => b.weather === w);
    return { key: w, label: weatherLabel[w], value: avg(g.map((x) => x.orders)), display: `${n0(avg(g.map((x) => x.orders)))} Bestellungen`, sub: `${g.length} Backtage`, color: "ochre" };
  });
  const sunG = guestRows[0].value, rainG = guestRows[2].value;
  const hi = orderRows.reduce((a, b) => (b.value > a.value ? b : a));
  const lo = orderRows.reduce((a, b) => (b.value < a.value ? b : a));
  const spread = (hi.value / lo.value - 1) * 100;
  const expect = Math.round((rainG * 1.1) / 5) * 5;
  const fc = data.forecast;

  const [guests, setGuests] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="ausw-stack">
      <div className="ausw-grid-2">
        <div className="ausw-stack">
          <Card title="Wetter und Biergarten" hint="Durchschnittliche Gäste pro Öffnungstag, je nach Wetter." icon={<IconSun size={20} aria-hidden />}>
            <Insight tone="good">
              Bei Sonne kommen <strong>{n1(sunG / rainG)}× so viele Gäste</strong> wie bei Regen ({n0(sunG)} statt {n0(rainG)}).
            </Insight>
            <BarList rows={guestRows} />
          </Card>

          <Card title="Gäste vom letzten Öffnungstag eintragen" hint="Eine Zahl pro Öffnungstag — dann wird die Wetter-Auswertung genauer." icon={<IconUsers size={20} aria-hidden />}>
            <form
              className="ausw-entry"
              onSubmit={(e) => { e.preventDefault(); if (guests) setSaved(true); }}
            >
              <label htmlFor="ausw-guests" className="ausw-entry-label">Wie viele Gäste waren am <strong>{data.lastOpening.label}</strong> da?</label>
              <div className="ausw-entry-row">
                <input
                  id="ausw-guests"
                  className="ausw-entry-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="z. B. 85"
                  value={guests}
                  onChange={(e) => { setGuests(e.target.value); setSaved(false); }}
                />
                <button type="submit" className="btn btn-primary" disabled={!guests}>Speichern</button>
              </div>
              {saved ? <p className="ausw-entry-ok" role="status"><IconCheck size={16} aria-hidden /> Danke — gespeichert. (Prototyp: noch nicht in der Datenbank)</p> : null}
            </form>
          </Card>
        </div>

        <div className="ausw-stack">
          <Card title={`Nächster Öffnungstag · ${fc.label}`} hint="Wettervorhersage und was du daraus für den Biergarten erwarten kannst." icon={WX_ICON[fc.weather]}>
            <Insight tone="warn">
              Bei {fc.temp} °C und {({ sonnig: "Sonne", wechselhaft: "wechselhaftem Wetter", regen: "Regen" } as const)[fc.weather]} kommen erfahrungsgemäß etwa <strong>{expect} Gäste</strong> — {n0((1 - expect / sunG) * 100)} % weniger als an einem Sonnentag. Plane kleiner: weniger Aufbau, Frischware knapper.
            </Insight>
            <div className="ausw-duo ausw-duo--3">
              <div>
                <p className="ausw-duo-label">Wetter</p>
                <p className="ausw-duo-value">{fc.temp} °C</p>
                <p className="ausw-duo-sub">{weatherLabel[fc.weather]}</p>
              </div>
              <div>
                <p className="ausw-duo-label">Erwartete Gäste</p>
                <p className="ausw-duo-value">≈ {expect}</p>
                <p className="ausw-duo-sub">Spanne {expect - 10}–{expect + 10}</p>
              </div>
              <div>
                <p className="ausw-duo-label">Zum Vergleich</p>
                <p className="ausw-duo-value">Ø {n0(sunG)}</p>
                <p className="ausw-duo-sub">an Sonnentagen</p>
              </div>
            </div>
          </Card>

          <Card title="Und die Backstube?" hint="Durchschnittliche Bestellungen pro Backtag, je nach Wetter (ganzes Jahr)." icon={<IconCloud size={20} aria-hidden />}>
            <Insight>
              {spread < 12
                ? <>Die Backstube ist <strong>fast wetterunabhängig</strong> — der Unterschied liegt bei höchstens {n0(spread)} %.</>
                : <>Bei <strong>{hi.label.toLowerCase()}</strong> bestellen die Leute am meisten ({n0(hi.value)}), bei {lo.label.toLowerCase()} am wenigsten ({n0(lo.value)}).</>}
            </Insight>
            <BarList rows={orderRows} />
          </Card>
        </div>
      </div>

      <WhatIf data={data} />
    </div>
  );
}

function WhatIf({ data }: { data: Data }) {
  const [id, setId] = useState("roggen");
  const [delta, setDelta] = useState(0.3);
  const [react, setReact] = useState<"kaum" | "normal" | "stark">("normal");
  const E = { kaum: 0.3, normal: 0.6, stark: 1.1 }[react];
  const item = data.items.find((i) => i.id === id)!;
  const price = currentPrice(item);
  const cost = itemCost(item, data.ingredients);
  const recent = data.backtage.slice(-8);
  const perMonth = avg(recent.map((b) => b.qty[id] ?? 0)) * 4.3;
  const newPrice = Math.max(0.1, price + delta);
  const chg = (newPrice - price) / price;
  const newQty = Math.max(0, perMonth * (1 - E * chg));
  const before = { qty: perMonth, rev: perMonth * price, profit: perMonth * (price - cost) };
  const after = { qty: newQty, rev: newQty * newPrice, profit: newQty * (newPrice - cost) };
  const dProfit = after.profit - before.profit;

  return (
    <Card title="Was wäre, wenn …?" hint="Schiebe den Preis und sieh sofort, was sich im Monat ändert." icon={<IconBulb size={20} aria-hidden />}>
      <div className="ausw-whatif">
        <div className="ausw-whatif-controls">
          <label className="ausw-field">
            <span>Welche Backware?</span>
            <select value={id} onChange={(e) => setId(e.target.value)}>
              {data.items.filter((i) => i.id !== "zwiebelkuchen").map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({eur2(currentPrice(i))})</option>
              ))}
            </select>
          </label>
          <label className="ausw-field">
            <span>Preis ändern um: <strong>{delta >= 0 ? "+" : "−"}{eur2(Math.abs(delta))}</strong> → neu {eur2(newPrice)}</span>
            <input type="range" min={-1} max={1} step={0.1} value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
            <span className="ausw-range-scale"><span>−1,00 €</span><span>±0</span><span>+1,00 €</span></span>
          </label>
          <div className="ausw-field">
            <span>Wie reagieren deine Kunden auf Preise?</span>
            <Segmented<"kaum" | "normal" | "stark">
              label="Preis-Reaktion"
              value={react}
              onChange={setReact}
              options={[{ id: "kaum", label: "Kaum" }, { id: "normal", label: "Normal" }, { id: "stark", label: "Stark" }]}
            />
            <span className="ausw-field-hint">„Normal“ entspricht deiner letzten Preisänderung.</span>
          </div>
        </div>

        <div className="ausw-whatif-result">
          <Insight tone={dProfit >= 0 ? "good" : "warn"}>
            {Math.abs(delta) < 0.05
              ? "Verschiebe den Regler, um eine Preisänderung durchzuspielen."
              : <>Mit {eur2(newPrice)} verdienst du ca. <strong>{n0(Math.abs(Math.round(dProfit)))} € {dProfit >= 0 ? "mehr" : "weniger"} pro Monat</strong> — bei {n0(Math.abs(newQty - perMonth))} Stück {newQty < perMonth ? "weniger" : "mehr"}.</>}
          </Insight>
          <div className="ausw-whatif-rows">
            {([
              ["Absatz pro Monat", `${n0(before.qty)} Stück`, `${n0(after.qty)} Stück`, ((after.qty - before.qty) / before.qty) * 100, true],
              ["Umsatz pro Monat", eur(before.rev), eur(after.rev), ((after.rev - before.rev) / before.rev) * 100, true],
              ["Gewinn pro Monat", eur(before.profit), eur(after.profit), ((after.profit - before.profit) / before.profit) * 100, true],
            ] as const).map(([l, b, a, d]) => (
              <div key={l} className="ausw-whatif-row">
                <span className="ausw-whatif-name">{l}</span>
                <span className="ausw-whatif-before">{b}</span>
                <span aria-hidden>→</span>
                <strong className="ausw-whatif-after">{a}</strong>
                <Delta value={d} />
              </div>
            ))}
          </div>
          <p className="ausw-footnote">Grobe Schätzung auf Basis der letzten 8 Backtage (4,3 Backtage pro Monat). Echte Kunden können anders reagieren.</p>
        </div>
      </div>
    </Card>
  );
}

/* =====================================================================
   Jahresrückblick
   ===================================================================== */
export function YearTab({ data }: { data: Data }) {
  const all = data.backtage;
  const units = sum(all.map((b) => b.units));
  const orders = sum(all.map((b) => b.orders));
  const revenue = sum(all.map((b) => b.revenue));
  const stats = itemStats(all, data);
  const fav = [...stats].sort((a, b) => b.qty - a.qty)[0];
  const richest = [...stats].sort((a, b) => b.revenue - a.revenue)[0];
  const bestDay = all.reduce((a, b) => (b.revenue > a.revenue ? b : a));
  const usage = ingredientUsage(sumQty(all), data);
  const flour = sum(usage.filter((u) => ["weizen", "dinkel", "roggen"].includes(u.ing.id)).map((u) => u.amount));
  const byMonth = new Map<number, { v: number; n: number }>();
  for (const b of all) {
    const e = byMonth.get(b.month) ?? { v: 0, n: 0 };
    e.v += b.revenue;
    e.n += 1;
    byMonth.set(b.month, e);
  }
  const months = [...byMonth.entries()];
  const bestM = months.reduce((a, b) => (b[1].v > a[1].v ? b : a));
  const lastMonth = months[months.length - 1][0];
  const cols: Col[] = months.map(([m, e]) => ({
    key: String(m), xLabel: MONTHS[m], value: e.v, color: m === bestM[0] ? "accent" : "neutral",
    title: `${MONTHS_LONG[m]}${m === lastMonth ? " (bisher)" : ""}`,
    lines: [`Umsatz: ${eur(e.v)}`, `${e.n} Backtag${e.n === 1 ? "" : "e"}`],
  }));
  const meters = fav.qty * 0.15;
  const brezelLen = meters >= 1000 ? `${n1(meters / 1000)} Kilometer` : `${n0(Math.round(meters / 10) * 10)} Meter`;

  return (
    <div className="ausw-stack">
      <section className="ausw-hero" aria-label="Dein Backjahr 2026">
        <p className="ausw-hero-kicker">Dein Backjahr 2026</p>
        <p className="ausw-hero-number">{n0(units)}</p>
        <p className="ausw-hero-text">Backwaren kamen aus deinem Ofen</p>
        <p className="ausw-hero-sub">an {all.length} Backtagen · für {n0(orders)} Bestellungen · {eur(revenue)} Umsatz</p>
      </section>

      <div className="ausw-stats ausw-stats--3">
        <StatTile label="Deine Lieblingsware" value={fav.item.name} note={`${n0(fav.qty)} Stück verkauft`} />
        <StatTile label="Umsatzstärkste Ware" value={richest.item.name} note={`${eur(richest.revenue)} Umsatz`} />
        <StatTile label="Bester Backtag" value={bestDay.label} note={`${eur(bestDay.revenue)} an einem Tag`} />
        <StatTile label="Stärkster Monat" value={MONTHS_LONG[bestM[0]]} note={`${eur(bestM[1].v)} an ${bestM[1].n} Backtagen`} />
        <StatTile label="Mehl verbacken" value={`${n0(flour)} kg`} note="Weizen, Dinkel und Roggen zusammen" />
        <StatTile label="Ø Warenkorb" value={eur2(revenue / orders)} note="pro Bestellung" />
      </div>

      <Card title="Umsatz pro Monat" hint="So hat sich dein Jahr entwickelt." icon={<IconTrendingUp size={20} aria-hidden />}>
        <Insight tone="good">
          Der <strong>{MONTHS_LONG[bestM[0]]}</strong> war dein stärkster Monat mit {eur(bestM[1].v)} (an {bestM[1].n} Backtagen).
        </Insight>
        <ColumnChart data={cols} fmt={eur} ariaLabel="Umsatz pro Monat 2026" height={250} labelEvery={1} />
      </Card>

      <Card title="Zahlen zum Schmunzeln" icon={<IconAward size={20} aria-hidden />}>
        <ul className="ausw-fun">
          <li>Alle verkauften Laugenbrezeln hintereinander gelegt: <strong>{brezelLen}</strong>.</li>
          <li>Du hast <strong>{n0(flour)} kg Mehl</strong> verbacken — das sind {n0(flour / 25)} Mehlsäcke à 25 kg.</li>
          <li>Im Schnitt hat jede Bestellung <strong>{n1(units / orders)} Backwaren</strong> enthalten.</li>
        </ul>
      </Card>
    </div>
  );
}
