"use client";

import { useState } from "react";
import { useWidth } from "./hooks";

/* Farb-Rollen (CSS-Variablen aus .ausw) */
const C = {
  accent: "var(--ausw-accent)",
  neutral: "var(--ausw-neutral)",
  ochre: "var(--ausw-ochre)",
  good: "var(--ausw-good)",
  grid: "var(--ausw-grid)",
  mute: "var(--color-text-secondary)",
  ink: "var(--color-text-primary)",
  surface: "var(--ausw-surface)",
};

function niceMax(max: number): { max: number; step: number } {
  const raw = max * 1.08;
  const pow = Math.pow(10, Math.floor(Math.log10(raw / 3)));
  const cand = [1, 2, 2.5, 5, 10].map((m) => m * pow);
  const step = cand.find((s) => raw / s <= 4) ?? cand[cand.length - 1];
  return { max: Math.ceil(raw / step) * step, step };
}

/** Balken mit 4px runder Kappe, am Boden gerade. */
function barPath(x: number, y: number, w: number, base: number, r = 4) {
  const h = base - y;
  const rr = Math.min(r, h / 2, w / 2);
  return `M${x},${base} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${base} Z`;
}

type Tip = { x: number; y: number; title: string; lines: string[] } | null;

function TipBox({ tip, width }: { tip: Tip; width: number }) {
  if (!tip) return null;
  const left = Math.min(Math.max(tip.x, 70), width - 70);
  return (
    <div className="ausw-tip" style={{ left, top: tip.y, transform: tip.y > 56 ? "translate(-50%, -100%)" : "translate(-50%, 10px)" }} role="status">
      <strong>{tip.title}</strong>
      {tip.lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

export type Col = {
  key: string;
  xLabel: string;
  value: number;
  title: string;
  lines: string[];
  color?: "accent" | "neutral" | "ochre";
  valueLabel?: string;
};

export function ColumnChart({
  data,
  fmt,
  avg,
  avgLabel,
  height = 250,
  ariaLabel,
  labelEvery,
  yUnit = "",
}: {
  data: Col[];
  fmt: (v: number) => string;
  avg?: number;
  avgLabel?: string;
  height?: number;
  ariaLabel: string;
  labelEvery?: number;
  yUnit?: string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const L = 44, R = 10, T = 28, B = 30;
  const plotW = Math.max(0, w - L - R);
  const plotH = height - T - B;
  const { max, step } = niceMax(Math.max(...data.map((d) => d.value), avg ?? 0, 1));
  const band = plotW / data.length;
  const barW = Math.max(4, Math.min(24, band * 0.62));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const y = (v: number) => T + plotH * (1 - v / max);
  const every = Math.max(labelEvery ?? 1, Math.ceil((labelEvery ? 32 : 46) / band));
  const best = data.reduce((bi, d, i) => (d.value > data[bi].value ? i : bi), 0);
  const last = data.length - 1;

  const tip: Tip =
    hover !== null && w
      ? {
          x: L + hover * band + band / 2,
          y: Math.max(0, y(data[hover].value) - 8),
          title: data[hover].title,
          lines: data[hover].lines,
        }
      : null;

  return (
    <div className="ausw-chart" ref={ref} onMouseLeave={() => setHover(null)}>
      {w > 0 ? (
        <svg width={w} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" className="ausw-axis">
                {t === 0 ? "0" : `${fmt(t).replace(/ €$/, "")}${yUnit}`}
              </text>
            </g>
          ))}
          {avg !== undefined ? (
            <line x1={L} x2={w - R} y1={y(avg)} y2={y(avg)} stroke={C.ink} strokeWidth={1.5} opacity={0.55} />
          ) : null}
          {data.map((d, i) => {
            const x = L + i * band + (band - barW) / 2;
            const dim = hover !== null && hover !== i;
            return (
              <g key={d.key} opacity={dim ? 0.45 : 1}>
                <path d={barPath(x, y(d.value), barW, y(0))} fill={C[d.color ?? "neutral"]} />
                {i % every === 0 || i === last ? (
                  <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="ausw-axis">
                    {d.xLabel}
                  </text>
                ) : null}
              </g>
            );
          })}
          {[best, last].filter((v, i, a) => a.indexOf(v) === i).map((i) => {
            const d = data[i];
            const x = L + i * band + band / 2;
            const lab = d.valueLabel ?? fmt(d.value);
            return (
              <text key={`l${i}`} x={Math.min(Math.max(x, L + 20), w - R - 20)} y={y(d.value) - 8} textAnchor="middle" className="ausw-label">
                {lab}
              </text>
            );
          })}
          {data.map((d, i) => (
            <rect
              key={`h${d.key}`}
              x={L + i * band}
              y={T}
              width={band}
              height={plotH + B}
              fill="transparent"
              tabIndex={0}
              role="presentation"
              aria-label={`${d.title}: ${d.lines.join(", ")}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              style={{ outline: "none" }}
            />
          ))}
        </svg>
      ) : null}
      <TipBox tip={tip} width={w} />
      {avg !== undefined ? (
        <ul className="ausw-legend ausw-legend--chart">
          <li><i className="ausw-swatch is-accent" aria-hidden />Letzter Backtag</li>
          <li><i className="ausw-swatch is-neutral" aria-hidden />Frühere Backtage</li>
          <li><i className="ausw-linekey" aria-hidden />{avgLabel ?? "Schnitt"}</li>
        </ul>
      ) : null}
    </div>
  );
}

export type Line = {
  key: string;
  name: string;
  color: "accent" | "neutral" | "ochre";
  values: (number | null)[];
  dashed?: boolean;
  area?: boolean;
  short?: string;
};

export function LineChart({
  xLabels,
  series,
  fmt,
  height = 250,
  ariaLabel,
  yMax,
}: {
  xLabels: string[];
  series: Line[];
  fmt: (v: number) => string;
  height?: number;
  ariaLabel: string;
  yMax?: number;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const L = 40, R = 14, T = 24, B = 30;
  const plotW = Math.max(0, w - L - R);
  const plotH = height - T - B;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const { max, step } = niceMax(yMax ?? Math.max(...all, 1));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const n = xLabels.length;
  const x = (i: number) => L + (plotW * i) / (n - 1);
  const y = (v: number) => T + plotH * (1 - v / max);

  const tip: Tip =
    hover !== null && w
      ? {
          x: x(hover),
          y: 0,
          title: xLabels[hover],
          lines: series
            .filter((s) => s.values[hover] !== null && s.values[hover] !== undefined)
            .map((s) => `${s.name}: ${fmt(s.values[hover] as number)}`),
        }
      : null;

  return (
    <div className="ausw-chart" ref={ref} onMouseLeave={() => setHover(null)}>
      {w > 0 ? (
        <svg width={w} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke={C.grid} strokeWidth={1} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" className="ausw-axis">{t}</text>
            </g>
          ))}
          {xLabels.map((l, i) => (
            <text key={l + i} x={x(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="ausw-axis">
              {l}
            </text>
          ))}
          {series.map((s) => {
            const pts = s.values.map((v, i) => (v === null ? null : ([x(i), y(v)] as const)));
            const real = pts.filter((p): p is readonly [number, number] => p !== null);
            if (!real.length) return null;
            const d = real.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
            const lastPt = real[real.length - 1];
            return (
              <g key={s.key}>
                {s.area ? (
                  <path d={`${d} L${lastPt[0]},${y(0)} L${real[0][0]},${y(0)} Z`} fill={C[s.color]} opacity={0.1} />
                ) : null}
                <path d={d} fill="none" stroke={C[s.color]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? "2 5" : undefined} />
                <circle cx={lastPt[0]} cy={lastPt[1]} r={5} fill={C[s.color]} stroke={C.surface} strokeWidth={2} />
              </g>
            );
          })}
          {(() => {
            const ends = series
              .map((s) => {
                const idx = s.values.reduce<number>((li, v, i) => (v === null ? li : i), -1);
                return idx < 0 ? null : { s, px: x(idx), py: y(s.values[idx] as number), v: s.values[idx] as number };
              })
              .filter((e): e is NonNullable<typeof e> => e !== null)
              .sort((p, q) => p.py - q.py);
            // Gleiche End-X zusammenfassen: nur ein Label pro Endpunkt-Paar, das oberste oben, das untere unten.
            return ends.map((e) => (
              <text
                key={`end-${e.s.key}`}
                x={e.px - 10}
                y={ends.some((o) => o !== e && Math.abs(o.px - e.px) < 40 && o.py < e.py) ? e.py + 22 : e.py - 12}
                textAnchor="end"
                className="ausw-label"
              >
                {e.s.short ? `${e.s.short} ` : ""}{fmt(e.v).replace(/ Bestellungen$/, "")}
              </text>
            ));
          })()}
          {hover !== null ? (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} stroke={C.ink} strokeWidth={1} opacity={0.35} />
              {series.map((s) => {
                const v = s.values[hover];
                return v === null || v === undefined ? null : (
                  <circle key={s.key} cx={x(hover)} cy={y(v)} r={5} fill={C[s.color]} stroke={C.surface} strokeWidth={2} />
                );
              })}
            </g>
          ) : null}
          <rect
            x={L - 10}
            y={T}
            width={plotW + 20}
            height={plotH}
            fill="transparent"
            onMouseMove={(e) => {
              const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
              const rel = (e.clientX - r.left - 10) / plotW;
              setHover(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
            }}
          />
        </svg>
      ) : null}
      <TipBox tip={tip} width={w} />
      <ul className="ausw-legend ausw-legend--chart">
        {series.map((s) => (
          <li key={s.key}>
            <i className={`ausw-${s.dashed ? "linekey is-dashed is" : "swatch is"}-${s.color}`} aria-hidden />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  // Eine Linie braucht mindestens zwei Punkte (sonst Division durch 0 → NaN im SVG).
  if (values.length < 2) return null;
  const W = 84, H = 32, p = 4;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [p + ((W - 2 * p) * i) / (values.length - 1), H - p - ((H - 2 * p) * (v - min)) / span] as const);
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const e = pts[pts.length - 1];
  return (
    <svg className="ausw-spark" width={W} height={H} aria-hidden>
      <path d={d} fill="none" stroke={C.neutral} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={e[0]} cy={e[1]} r={4} fill={C.accent} stroke={C.surface} strokeWidth={2} />
    </svg>
  );
}

/** Heatmap: eine Farbe (Rot), je dunkler desto mehr Bestellungen. */
export function Heatmap({
  rows,
  cols,
  values,
  unit,
}: {
  rows: string[];
  cols: string[];
  values: number[][];
  unit: string;
}) {
  const [tip, setTip] = useState<{ r: number; c: number } | null>(null);
  const flat = values.flat();
  const max = Math.max(...flat, 1);
  let pr = 0, pc = 0;
  values.forEach((row, r) => row.forEach((v, c) => { if (v > values[pr][pc]) { pr = r; pc = c; } }));
  return (
    <div className="ausw-heat" onMouseLeave={() => setTip(null)}>
      <div className="ausw-heat-grid" style={{ gridTemplateColumns: `2.5rem repeat(${cols.length}, 1fr)` }}>
        <span />
        {cols.map((c) => (
          <span key={c} className="ausw-heat-col">{c}</span>
        ))}
        {rows.map((r, ri) => (
          <HeatRow key={r} label={r}>
            {values[ri].map((v, ci) => {
              const isPeak = ri === pr && ci === pc;
              return (
                <button
                  key={ci}
                  type="button"
                  className={`ausw-heat-cell${isPeak ? " is-peak" : ""}`}
                  style={{ background: `color-mix(in srgb, var(--ausw-accent) ${Math.round((v / max) * 88) + (v ? 6 : 0)}%, var(--ausw-surface))` }}
                  aria-label={`${r}, ${cols[ci]} Uhr: ${v} ${unit}`}
                  onMouseEnter={() => setTip({ r: ri, c: ci })}
                  onFocus={() => setTip({ r: ri, c: ci })}
                  onBlur={() => setTip(null)}
                >
                  {isPeak ? <span className="ausw-heat-peak">Meiste</span> : null}
                </button>
              );
            })}
          </HeatRow>
        ))}
      </div>
      <p className="ausw-heat-readout" aria-live="polite">
        {tip
          ? <><strong>{rows[tip.r]}, {cols[tip.c]} Uhr:</strong> {values[tip.r][tip.c]} {unit}</>
          : <>Fahr mit der Maus über ein Feld für die genaue Zahl.</>}
      </p>
      <div className="ausw-heat-scale" aria-hidden>
        <span>weniger</span>
        <i />
        <span>mehr</span>
      </div>
    </div>
  );
}

function HeatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="ausw-heat-row">{label}</span>
      {children}
    </>
  );
}
