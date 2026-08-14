"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberFieldProps {
  id: string;
  label?: string;
  /** Null means "empty", which is distinct from zero. */
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  error?: string;
  description?: string;
  min?: number;
  disabled?: boolean;
  /** Rendered inside the field, e.g. "Rp" or "%". */
  prefix?: string;
  suffix?: string;
  "aria-label"?: string;
  className?: string;
}

const grouped = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/**
 * A whole-number input that shows thousands separators while typing.
 *
 * `<input type="number">` cannot do this: the browser requires its value to be
 * a bare numeral, so "100000" stays unreadable at exactly the moment the user
 * is checking it. This is a text input that formats on every keystroke and
 * hands the parent a number, so the form still works in numbers while the
 * person works in something legible.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  description,
  min = 0,
  disabled,
  prefix,
  suffix,
  className,
  ...rest
}: NumberFieldProps) {
  const [draft, setDraft] = useState(() => format(value));
  const [lastValue, setLastValue] = useState(value);

  // Follow the parent when it reseeds the form, without an effect.
  if (value !== lastValue) {
    setLastValue(value);
    // Keep what the user is typing if it already means the same number, so the
    // caret does not jump while they edit.
    if (parse(draft) !== value) setDraft(format(value));
  }

  function handleChange(text: string) {
    // Keep only digits: the separators are ours to add, not the user's to type.
    const digits = text.replace(/\D/g, "");

    if (digits === "") {
      setDraft("");
      onChange(null);
      return;
    }

    const parsed = Math.max(min, Number(digits));
    setDraft(grouped.format(parsed));
    onChange(parsed);
  }

  const describedBy = [
    error ? `${id}-error` : null,
    description ? `${id}-description` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}

      <div className="relative">
        {prefix ? (
          <span
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            aria-hidden
          >
            {prefix}
          </span>
        ) : null}

        <Input
          id={id}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          // Numeric keypad on mobile, but a text field so the separators survive.
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={[
            "tabular-nums",
            prefix ? "pl-9" : "",
            suffix ? "pr-9" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {suffix ? (
          <span
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm"
            aria-hidden
          >
            {suffix}
          </span>
        ) : null}
      </div>

      {description ? (
        <p id={`${id}-description`} className="text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function format(value: number | null): string {
  return value == null ? "" : grouped.format(value);
}

function parse(text: string): number | null {
  const digits = text.replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
}
