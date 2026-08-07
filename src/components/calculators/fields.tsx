"use client";

import type { ReactNode } from "react";

/** Labeled number input with a prefix/suffix and optional range slider. */
export function Field({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  slider = false,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  slider?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-medium text-ink-800">
        {label}
        {help && <span className="text-xs font-normal text-muted">{help}</span>}
      </span>
      <div className="mt-1.5 flex items-center rounded-xl border border-border bg-white focus-within:border-crush-400 focus-within:ring-2 focus-within:ring-crush-500/20">
        {prefix && (
          <span className="pl-3 text-sm text-muted select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent px-3 py-2.5 text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pr-3 text-sm text-muted select-none">{suffix}</span>
        )}
      </div>
      {slider && max !== undefined && (
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="mt-2 w-full accent-crush-500"
        />
      )}
    </label>
  );
}

/** Big highlighted result. */
export function ResultCard({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-ink-900 p-6 text-white">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
      {children}
    </div>
  );
}

/** One row in a breakdown list. */
export function Row({
  label,
  value,
  strong = false,
  accent = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        strong ? "border-t border-border pt-3 font-semibold" : ""
      }`}
    >
      <span className={strong ? "text-ink-900" : "text-muted"}>{label}</span>
      <span
        className={`tabular-nums ${
          accent ? "text-crush-600 font-semibold" : "text-ink-900"
        } ${strong ? "text-lg" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/** Horizontal stacked bar visualizing payment components. */
export function StackBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            title={`${s.label}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
      </div>
    </div>
  );
}
