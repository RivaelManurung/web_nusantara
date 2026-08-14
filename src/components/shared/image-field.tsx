"use client";

import { ImagePlus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { ImagePreviewDialog } from "./image-preview-dialog";

interface ImageFieldProps {
  id: string;
  label: string;
  /** Existing image URL, shown until the user picks a replacement. */
  currentUrl?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  /** Rejects anything larger, before it reaches the network. */
  maxSizeMb?: number;
}

/**
 * File picker with a live preview.
 *
 * Size is checked here rather than only on the server: uploading two megabytes
 * to be told it was too large wastes the user's data allowance, which matters
 * on the mobile connections this admin panel is used on.
 */
export function ImageField({
  id,
  label,
  currentUrl,
  value,
  onChange,
  error,
  maxSizeMb = 2,
}: ImageFieldProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Derived from the chosen file rather than mirrored into state, so there is
  // no render where the preview and the file disagree.
  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  // Object URLs pin the file in memory until revoked.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function handleSelect(file: File | null) {
    setLocalError(null);

    if (file && file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`Ukuran gambar maksimal ${maxSizeMb} MB.`);
      onChange(null);
      return;
    }
    onChange(file);
  }

  const shownUrl = preview ?? currentUrl;
  const message = localError ?? error;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex items-start gap-3">
        <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md border">
          {shownUrl ? (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="relative size-full"
              aria-label={`Pratinjau ${label}`}
            >
              <Image
                src={shownUrl}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center">
              <ImagePlus className="size-6" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* The native control renders as "Choose File / No file chosen",
              which cannot be styled and reads differently in every browser.
              A label styled as a button drives the same hidden input. */}
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-invalid={Boolean(message)}
            aria-describedby={message ? `${id}-error` : undefined}
            onChange={(event) => handleSelect(event.target.files?.[0] ?? null)}
          />
          <label
            htmlFor={id}
            className="border-input bg-background hover:bg-accent focus-within:ring-ring inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            <Upload className="size-4" aria-hidden />
            {value ? "Ganti gambar" : "Pilih gambar"}
          </label>
          {value ? (
            <span className="text-muted-foreground ml-2 text-sm">
              {value.name}
            </span>
          ) : null}
          <p className="text-muted-foreground text-xs">
            PNG, JPG, atau WebP. Maksimal {maxSizeMb} MB.
          </p>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(null)}
            >
              <X className="size-4" aria-hidden />
              Hapus pilihan
            </Button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {message}
        </p>
      ) : null}

      <ImagePreviewDialog
        src={previewOpen ? (shownUrl ?? null) : null}
        alt={label}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
