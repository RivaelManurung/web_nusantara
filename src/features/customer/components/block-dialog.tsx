"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

/** Matches customer.MaxReasonRunes on the server. */
const MAX_REASON = 500;

interface BlockDialogProps {
  open: boolean;
  /** True when the dialog will block; false when it will restore access. */
  isBlocking: boolean;
  customerName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * Confirms blocking or unblocking an account, collecting the reason.
 *
 * ConfirmDialog cannot serve here: blocking must capture free text, and the
 * server refuses the request without it. The reason is the whole point of the
 * audit trail -- "kenapa akun ini diblokir?" has to be answerable six months
 * later, and nobody reconstructs that from memory.
 *
 * The draft is reset by remounting -- the caller keys this on `open` -- rather
 * than by an effect that clears it.
 */
export function BlockDialog({
  open,
  isBlocking,
  customerName,
  isPending,
  onCancel,
  onConfirm,
}: BlockDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const fieldId = useId();

  const trimmed = reason.trim();
  const missing = isBlocking && trimmed === "";
  const tooLong = trimmed.length > MAX_REASON;
  const error =
    touched && missing
      ? "Alasan wajib diisi saat memblokir akun."
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
            {isBlocking ? "Blokir akun" : "Aktifkan kembali akun"}{" "}
            {customerName}?
          </DialogTitle>
          <DialogDescription>
            {isBlocking
              ? "Akun tidak akan bisa masuk lagi, dan seluruh sesi yang sedang berjalan langsung dihentikan."
              : "Akun akan bisa masuk kembali. Pemblokiran sebelumnya tetap tercatat di riwayat."}
          </DialogDescription>
        </DialogHeader>

        {isBlocking ? (
          <Alert>
            <AlertDescription>
              Tindakan ini tercatat beserta nama Anda dan waktunya. Pesanan yang
              sudah dibuat tidak ikut terhapus.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={fieldId}>
            Alasan {isBlocking ? "" : "(opsional)"}
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
              isBlocking
                ? "Contoh: pola order-lalu-batal berulang untuk memanen poin"
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
          <Button
            variant={isBlocking ? "destructive" : "default"}
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Memproses…
              </>
            ) : isBlocking ? (
              "Blokir akun"
            ) : (
              "Aktifkan kembali"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
