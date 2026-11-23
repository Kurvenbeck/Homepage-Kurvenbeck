"use client";

import type { ReactNode } from "react";
import { IconArrowDownRight, IconArrowUpRight, IconMinus, IconTable } from "@tabler/icons-react";
import { Sparkline } from "./charts";
export { useWidth } from "./hooks";

export function Card({
  title,
  hint,
  icon,
  children,
  className = "",
  action,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`ausw-card ${className}`}>
      <header className="ausw-card-head">
        <div className="ausw-card-titlewrap">
          {icon ? <span className="ausw-card-icon" aria-hidden>{icon}</span> : null}
          <div>
            <h3 className="ausw-card-title">{title}</h3>
            {hint ? <p className="ausw-card-hint">{hint}</p> : null}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Die Kernaussage in einem Satz — das Erste, was man liest. */
export function Insight({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "good" | "warn" }) {
  return <p className={`ausw-insight ausw-insight--${tone}`}>{children}</p>;
}

export function Delta({
  value,
  suffix = "%",
  label,
  goodWhenUp = true,
  digits = 0,
}: {
  value: number;
  suffix?: string;
  label?: string;
  goodWhenUp?: boolean;
  digits?: number;
}) {
  const flat = Math.abs(value) < 0.5;
  const up = value > 0;
  const good = flat ? null : up === goodWhenUp;
  const Icon = flat ? IconMinus : up ? IconArrowUpRight : IconArrowDownRight;
  const num = Math.abs(value).toLocaleString("de-DE", { maximumFractionDigits: digits });
  return (
    <span className={`ausw-delta ${good === null ? "is-flat" : good ? "is-good" : "is-bad"}`}>
      <Icon size={16} stroke={2} aria-hidden />
      <span>
        {flat ? "±0" : `${up ? "+" : "−"}${num}`} {suffix}
      </span>
      {label ? <span className="ausw-delta-label">{label}</span> : null}
    </span>
  );
}

export function StatTile({
  label,
  value,
  delta,
  deltaLabel = "vs. Schnitt",
  goodWhenUp = true,
  spark,
  note,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  goodWhenUp?: boolean;
  spark?: number[];
  note?: string;
}) {
  return (
    <div className="ausw-stat">
      <p className="ausw-stat-label">{label}</p>
      <div className="ausw-stat-row">
        <p className="ausw-stat-value">{value}</p>
        {spark ? <Sparkline values={spark} /> : null}
      </div>
      {delta !== undefined ? (
        <Delta value={delta} label={deltaLabel} goodWhenUp={goodWhenUp} />
      ) : null}
      {note ? <p className="ausw-stat-note">{note}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="ausw-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`ausw-seg-btn${value === o.id ? " is-active" : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export type BarRow = {
  key: string;
  label: string;
  value: number;
  display: string;
  sub?: string;
  badge?: { text: string; tone: "good" | "warn" | "muted" };
  color?: "accent" | "neutral" | "ochre" | "good";
};

/** Waagerechte Balkenliste — der Klassiker für „wer ist vorn". */
export function BarList({
  rows,
  ranked = false,
  max,
}: {
  rows: BarRow[];
  ranked?: boolean;
  max?: number;
}) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol className={`ausw-bars${ranked ? " is-ranked" : ""}`}>
      {rows.map((r, i) => (
        <li key={r.key} className="ausw-bar-row">
          {ranked ? <span className={`ausw-bar-rank${i === 0 ? " is-first" : ""}`}>{i + 1}</span> : null}
          <div className="ausw-bar-label">
            <span className="ausw-bar-name">{r.label}</span>
            {r.sub ? <span className="ausw-bar-sub">{r.sub}</span> : null}
          </div>
          <div className="ausw-bar-track" aria-hidden>
            <div
              className={`ausw-bar-fill is-${r.color ?? (ranked && i === 0 ? "accent" : "neutral")}`}
              style={{ width: `${Math.max(2, (r.value / m) * 100)}%` }}
            />
          </div>
          <div className="ausw-bar-value">
            <strong>{r.display}</strong>
            {r.badge ? <span className={`ausw-badge is-${r.badge.tone}`}>{r.badge.text}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export type SegPart = { key: string; label: string; value: number; color: "accent" | "ochre" | "good" | "neutral" };

/** Ein Ganzes, in Teile zerlegt (z. B. Anteil vegan/vegetarisch). */
export function SegBar({ parts, unit = "" }: { parts: SegPart[]; unit?: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="ausw-segbar" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}${unit}`).join(", ")}>
        {parts
          .filter((p) => p.value > 0)
          .map((p) => {
            const share = (p.value / total) * 100;
            return (
              <div
                key={p.key}
                className={`ausw-segbar-part is-${p.color}`}
                style={{ width: `${share}%` }}
                title={`${p.label}: ${p.value}${unit} (${Math.round(share)} %)`}
              >
                {share >= 12 ? `${Math.round(share)} %` : ""}
              </div>
            );
          })}
      </div>
      <ul className="ausw-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <i className={`ausw-swatch is-${p.color}`} aria-hidden />
            {p.label} <strong>{p.value}{unit}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="ausw-table">
      <summary>
        <IconTable size={16} aria-hidden /> Zahlen als Tabelle
      </summary>
      <div className="ausw-table-scroll">
        <table>
          <thead>
            <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
