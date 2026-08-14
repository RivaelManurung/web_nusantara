"use client";

import { format, isValid, parse } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** The shape the form and the API exchange: a plain calendar date. */
const WIRE_FORMAT = "yyyy-MM-dd";
/** What the user reads and types. */
const DISPLAY_FORMAT = "dd/MM/yyyy";

interface DateFieldProps {
  id: string;
  label: string;
  /** `yyyy-MM-dd`, or empty. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * A date input backed by the design system's calendar.
 *
 * `<input type="date">` renders the browser's own control, which ignores the
 * app's theme, changes shape between Chrome, Safari and Firefox, and shows
 * month names in the browser's locale rather than the interface's. This keeps
 * the typed field -- fastest for someone who knows the date -- and puts a
 * themed, Indonesian calendar behind it for everyone else.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  error,
  description,
  disabled,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  // The text the user is typing, which may be incomplete and so cannot live in
  // the parent's `yyyy-MM-dd` state until it parses.
  const [draft, setDraft] = useState(() => toDisplay(value));
  const [lastValue, setLastValue] = useState(value);

  // Adjusting state during render rather than in an effect: the parent resets
  // the value when the form reseeds, and the draft has to follow.
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(toDisplay(value));
  }

  const selected = fromWire(value);
  const describedBy = [
    error ? `${id}-error` : null,
    description ? `${id}-description` : null,
  ]
    .filter(Boolean)
    .join(" ");

  function commitDraft(text: string) {
    const trimmed = text.trim();
    if (trimmed === "") {
      onChange("");
      return;
    }

    const parsed = parse(trimmed, DISPLAY_FORMAT, new Date());
    if (isValid(parsed)) {
      onChange(format(parsed, WIRE_FORMAT));
    } else {
      // Unparseable input snaps back rather than silently clearing a date the
      // user had already chosen.
      setDraft(toDisplay(value));
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commitDraft(event.target.value)}
          placeholder="dd/mm/yyyy"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="pr-10 tabular-nums"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
                aria-label={`Pilih ${label.toLowerCase()} dari kalender`}
              >
                <CalendarDays className="size-4" aria-hidden />
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              locale={localeID}
              selected={selected}
              defaultMonth={selected}
              onSelect={(next) => {
                if (next) onChange(format(next, WIRE_FORMAT));
                setOpen(false);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {description ? (
        <p id={`${id}-description`} className="text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={cn("text-destructive text-sm")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function fromWire(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, WIRE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toDisplay(value: string): string {
  const parsed = fromWire(value);
  return parsed ? format(parsed, DISPLAY_FORMAT) : "";
}
