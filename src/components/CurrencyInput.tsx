"use client";

import { useEffect, useState } from "react";

/** Digits only (drops $, commas, spaces). */
export const digitsOnly = (s: string) => s.replace(/[^\d]/g, "");

/** Format a number with thousands separators, or "" for null/NaN. */
export const commafy = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "" : n.toLocaleString("en-US");

/**
 * A text input that shows a dollar amount with commas as the user types, while
 * reporting the plain numeric value to `onChange`. Use everywhere a purchase /
 * property / loan price is entered so the display is friendly but calculations,
 * forms, and APIs keep the real number.
 */
export function CurrencyInput({
  value,
  onChange,
  className,
  placeholder,
  id,
  name,
  "aria-label": ariaLabel,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
}) {
  const [display, setDisplay] = useState<string>(commafy(value));

  // Keep the field in sync when the value is changed from outside (prefill,
  // reset, a linked %/$ pair) — but don't fight the user mid-type.
  useEffect(() => {
    const shown = display === "" ? undefined : Number(digitsOnly(display));
    if ((value ?? undefined) !== (shown ?? undefined)) setDisplay(commafy(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const d = digitsOnly(e.target.value);
    if (d === "") {
      setDisplay("");
      onChange(undefined);
      return;
    }
    const n = Number(d);
    setDisplay(n.toLocaleString("en-US"));
    onChange(n);
  }

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      className={className}
      placeholder={placeholder}
      value={display}
      onChange={handle}
    />
  );
}
