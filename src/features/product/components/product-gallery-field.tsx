"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { GalleryItem } from "../types";

interface Props {
  id: string;
  label: string;
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  /** Rejects anything larger, before it reaches the network. */
  maxSizeMb?: number;
}

/**
 * Multi-image picker for the product gallery.
 *
 * Existing and newly picked images share one strip so the user edits the
 * gallery they will end up with, rather than reasoning about which of two
 * lists an image came from.
 */
export function ProductGalleryField({
  id,
  label,
  value,
  onChange,
  maxSizeMb = 2,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  // Object URLs pin the file in memory until revoked, so they are created once
  // per item and released when that item leaves the strip.
  const previews = useMemo(
    () =>
      value.map((item) =>
        item.kind === "existing" ? item.url : URL.createObjectURL(item.file),
      ),
    [value],
  );

  useEffect(() => {
    return () => {
      for (const url of previews) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
    };
  }, [previews]);

  function handleSelect(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    const tooLarge = picked.find((file) => file.size > maxSizeMb * 1024 * 1024);
    if (tooLarge) {
      setError(`Ukuran setiap gambar maksimal ${maxSizeMb} MB.`);
      return;
    }

    onChange([
      ...value,
      ...picked.map((file) => ({ kind: "new" as const, file })),
    ]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_item, position) => position !== index));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          handleSelect(event.target.files);
          // Clearing lets the same file be picked again after a removal.
          event.target.value = "";
        }}
      />
      <p className="text-muted-foreground text-xs">
        Bisa pilih lebih dari satu. PNG, JPG, atau WebP, maksimal {maxSizeMb} MB
        per gambar.
      </p>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pt-1">
          {value.map((item, index) => (
            <li
              key={item.kind === "existing" ? item.url : `new-${index}`}
              className="relative"
            >
              <div className="bg-muted relative size-20 overflow-hidden rounded-md border">
                <Image
                  src={previews[index]}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 size-6 rounded-full"
                onClick={() => removeAt(index)}
                aria-label={`Hapus gambar ${index + 1}`}
              >
                <X className="size-3" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
