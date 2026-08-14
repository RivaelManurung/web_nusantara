"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  cancelHref: string;
  isPending: boolean;
  submitLabel?: string;
}

/** The save/cancel row shared by every form screen. */
export function FormActions({
  cancelHref,
  isPending,
  submitLabel = "Simpan",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        render={<Link href={cancelHref} />}
      >
        Batal
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Menyimpan…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
