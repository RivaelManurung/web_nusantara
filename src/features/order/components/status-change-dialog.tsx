"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { statusLabel } from "../types";

/** Matches order.MaxReasonRunes on the server. */
const MAX_REASON = 500;

interface StatusChangeDialogProps {
  /** The status being moved to, or null when the dialog is closed. */
  target: string | null;
  currentStatus: string;
  /** True when this transition may not proceed without an explanation. */
  reasonRequired: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * Confirms a status change, collecting the reason when one is required.
 *
 * ConfirmDialog cannot serve here: cancelling and rejecting must capture free
 * text, and the server refuses the request without it. Asking for the reason at
 * the moment it is known is far cheaper than reconstructing it from a customer
 * complaint three weeks later.
 *
 * Which transitions demand a reason is decided by the API and carried on the
 * order as reason_required_for, so this component never owns a second copy of
 * that rule.
 */
export function StatusChangeDialog({
  target,
  currentStatus,
  reasonRequired,
  isPending,
  onCancel,
  onConfirm,
}: StatusChangeDialogProps) {
  // The draft reason is per-transition state. It is reset by remounting -- the
  // caller keys this component on `target` -- rather than by an effect that
  // clears it, which would be a cascading render for something React already
  // does correctly with a key.
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const fieldId = useId();

  const open = target !== null;
  const trimmed = reason.trim();
  const missing = reasonRequired && trimmed === "";
  const tooLong = trimmed.length > MAX_REASON;
  const error =
    touched && missing
      ? "Alasan wajib diisi untuk pembatalan atau penolakan."
      : tooLong
        ? `Alasan maksimal ${MAX_REASON} karakter.`
        : null;

  function submit() {
    setTouched(true);
    if (missing || tooLong) return;
    onConfirm(trimmed);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ubah status ke {target ? statusLabel(target) : ""}?
          </DialogTitle>
          <DialogDescription>
            Pesanan akan berpindah dari {statusLabel(currentStatus)} ke{" "}
            {target ? statusLabel(target) : ""}. Perubahan ini tercatat beserta
            nama Anda dan tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            Alasan {reasonRequired ? "" : "(opsional)"}
          </Label>
          <Textarea
            id={fieldId}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            placeholder={
              reasonRequired
                ? "Contoh: stok habis, pelanggan membatalkan lewat telepon"
                : "Catatan tambahan bila perlu"
            }
          />
          {error ? (
            <p id={`${fieldId}-error`} className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isPending}>
                Batal
              </Button>
            }
          />
          <Button onClick={submit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Menyimpan…
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
