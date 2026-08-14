"use client";

import { useState } from "react";

import { DateField } from "@/components/shared/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * The wire format the event form speaks: the same string `<input
 * type="datetime-local">` produced, i.e. local wall-clock time with no zone.
 * `new Date("2026-08-14T09:30")` reads it back in the browser's own zone, which
 * is what `onSubmit` relies on when it calls `toISOString()`.
 */
const SEPARATOR = "T";
/** Chars in `yyyy-MM-dd`. */
const DATE_LENGTH = 10;
/** Chars in `HH:mm`. */
const TIME_LENGTH = 5;
/** What a date gets paired with until the user picks an hour. */
const DEFAULT_TIME = "00:00";

interface DateTimeFieldProps {
  id: string;
  label: string;
  /** `yyyy-MM-ddTHH:mm`, or empty. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  description?: string;
  disabled?: boolean;
  /** The second, narrower control's own label. */
  timeLabel?: string;
}

/**
 * A date and a time, side by side.
 *
 * `DateField` is deliberately date-only -- most of the panel schedules by day.
 * An event needs the hour as well, so this pairs the shared calendar field with
 * a small time input and joins the two halves back into the single
 * `datetime-local` string the form and the API already exchange. Only this
 * feature needs it, so it lives here rather than in `components/shared`.
 */
export function DateTimeField({
  id,
  label,
  value,
  onChange,
  error,
  description,
  disabled,
  timeLabel = "Jam",
}: DateTimeFieldProps) {
  const dateId = `${id}-date`;
  const timeId = `${id}-time`;

  const date = toDatePart(value);
  // The time lives in local state as well, so clearing the control to retype it
  // does not snap back to the default while the value stays wire-valid.
  const [time, setTime] = useState(() => toTimePart(value));
  const [lastValue, setLastValue] = useState(value);

  // Adjusting state during render rather than in an effect: the parent reseeds
  // the value when the form loads a record, and the time has to follow.
  if (value !== lastValue) {
    setLastValue(value);
    setTime(toTimePart(value));
  }

  function emit(nextDate: string, nextTime: string) {
    // No day means no value at all, which is what the required check reads.
    if (!nextDate) {
      onChange("");
      return;
    }
    onChange(`${nextDate}${SEPARATOR}${nextTime || DEFAULT_TIME}`);
  }

  // `DateField` owns the description and the error message for the pair; the
  // time input points at the same nodes so both halves announce them.
  const describedBy = [
    error ? `${dateId}-error` : null,
    description ? `${dateId}-description` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
      <DateField
        id={dateId}
        label={label}
        value={date}
        onChange={(nextDate) => emit(nextDate, time)}
        error={error}
        description={description}
        disabled={disabled}
      />

      <div className="space-y-2">
        <Label htmlFor={timeId}>{timeLabel}</Label>
        <Input
          id={timeId}
          type="time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value);
            emit(date, event.target.value);
          }}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="w-32 tabular-nums"
        />
      </div>
    </div>
  );
}

function toDatePart(value: string): string {
  return value.slice(0, DATE_LENGTH);
}

function toTimePart(value: string): string {
  const time = value.slice(DATE_LENGTH + SEPARATOR.length);
  return time.slice(0, TIME_LENGTH);
}
