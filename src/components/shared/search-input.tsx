"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Milliseconds to wait before reporting a change. */
  delay?: number;
}

/**
 * Debounced search box.
 *
 * Reporting on every keystroke sends one request per character; 350ms is long
 * enough to collapse a typed word into a single request and short enough that
 * the list still feels live.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Cari…",
  delay = 350,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const [lastSyncedValue, setLastSyncedValue] = useState(value);

  // Keep in step when the parent resets the query, e.g. on tab change.
  // Adjusting state during render rather than in an effect: React re-runs this
  // component before touching the DOM, so the stale draft is never painted.
  if (value !== lastSyncedValue) {
    setLastSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;

    const timer = setTimeout(() => onChange(draft), delay);
    return () => clearTimeout(timer);
  }, [delay, draft, onChange, value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pr-9 pl-9"
      />
      {draft ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          onClick={() => setDraft("")}
          aria-label="Bersihkan pencarian"
        >
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
