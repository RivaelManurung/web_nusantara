"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";

import { useCreateVoucher, useUpdateVoucher } from "../queries";
import type { Voucher, VoucherDiscountType } from "../types";

const DISCOUNT_TYPES: { label: string; value: VoucherDiscountType }[] = [
  { label: "Persen", value: "percent" },
  { label: "Nominal", value: "amount" },
];

const schema = z
  .object({
    code: z
      .string()
      .min(3, "Kode minimal 3 karakter.")
      .max(50, "Kode maksimal 50 karakter."),
    description: z.string().max(1000, "Deskripsi maksimal 1000 karakter."),
    discountType: z.enum(["percent", "amount"]),
    discountPercent: z
      .number()
      .min(0, "Tidak boleh negatif.")
      .max(100, "Maksimal 100%."),
    discountAmount: z.number().min(0, "Tidak boleh negatif."),
    minimumSpend: z.number().min(0, "Tidak boleh negatif."),
    pointCost: z.number().min(0, "Tidak boleh negatif."),
    quota: z.number().min(1, "Kuota minimal 1."),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi."),
    endDate: z.string().min(1, "Tanggal berakhir wajib diisi."),
  })
  .superRefine((values, ctx) => {
    if (values.discountType === "percent" && values.discountPercent <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["discountPercent"],
        message: "Persentase diskon harus lebih dari 0.",
      });
    }
    if (values.discountType === "amount" && values.discountAmount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "Nominal diskon harus lebih dari 0.",
      });
    }
    if (values.endDate < values.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Tanggal berakhir tidak boleh sebelum tanggal mulai.",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: Voucher | null;
}

export function VoucherFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  // `useWatch` rather than `watch`: it subscribes to one field instead of
  // returning a fresh function on every render.
  const discountType = useWatch({ control, name: "discountType" });
  const minimumSpend = useWatch({ control, name: "minimumSpend" });

  // Re-seed whenever the dialog opens, so reopening after a cancel does not
  // show the previous row's values.
  useEffect(() => {
    if (!open) return;
    reset(editing ? toFormValues(editing) : emptyValues());
  }, [editing, open, reset]);

  async function onSubmit(values: FormValues) {
    const input = {
      code: values.code,
      description: values.description,
      discountType: values.discountType,
      discountPercent: values.discountPercent,
      discountAmount: values.discountAmount,
      minimumSpend: values.minimumSpend,
      pointCost: values.pointCost,
      quota: values.quota,
      startDate: toIsoStart(values.startDate),
      endDate: toIsoEnd(values.endDate),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Ubah voucher" : "Tambah voucher"}
          </DialogTitle>
          <DialogDescription>
            Voucher ditukar pelanggan dengan poin dan berlaku pada rentang
            tanggal yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="voucher-code">Kode voucher</Label>
              <Input
                id="voucher-code"
                placeholder="MERDEKA17"
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? "voucher-code-error" : undefined}
                {...register("code")}
              />
              {errors.code ? (
                <p id="voucher-code-error" className="text-destructive text-sm">
                  {errors.code.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-discount-type">Tipe diskon</Label>
              <Controller
                control={control}
                name="discountType"
                render={({ field }) => (
                  <Select
                    items={DISCOUNT_TYPES}
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as VoucherDiscountType)
                    }
                  >
                    <SelectTrigger
                      id="voucher-discount-type"
                      className="w-full"
                      aria-invalid={Boolean(errors.discountType)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCOUNT_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {discountType === "percent" ? (
            <div className="space-y-2">
              <Label htmlFor="voucher-discount-percent">
                Persentase diskon (%)
              </Label>
              <Input
                id="voucher-discount-percent"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                aria-invalid={Boolean(errors.discountPercent)}
                aria-describedby={
                  errors.discountPercent
                    ? "voucher-discount-percent-error"
                    : undefined
                }
                {...register("discountPercent", { valueAsNumber: true })}
              />
              {errors.discountPercent ? (
                <p
                  id="voucher-discount-percent-error"
                  className="text-destructive text-sm"
                >
                  {errors.discountPercent.message}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="voucher-discount-amount">
                Nominal diskon (Rp)
              </Label>
              <Input
                id="voucher-discount-amount"
                type="number"
                min={0}
                placeholder="25000"
                aria-invalid={Boolean(errors.discountAmount)}
                aria-describedby={
                  errors.discountAmount
                    ? "voucher-discount-amount-error"
                    : undefined
                }
                {...register("discountAmount", { valueAsNumber: true })}
              />
              {errors.discountAmount ? (
                <p
                  id="voucher-discount-amount-error"
                  className="text-destructive text-sm"
                >
                  {errors.discountAmount.message}
                </p>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="voucher-description">Deskripsi</Label>
            <Textarea
              id="voucher-description"
              rows={3}
              placeholder="Berlaku untuk semua produk keripik."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "voucher-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description ? (
              <p
                id="voucher-description-error"
                className="text-destructive text-sm"
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="voucher-minimum-spend">Minimal belanja (Rp)</Label>
              <Input
                id="voucher-minimum-spend"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.minimumSpend)}
                aria-describedby="voucher-minimum-spend-hint"
                {...register("minimumSpend", { valueAsNumber: true })}
              />
              <p
                id="voucher-minimum-spend-hint"
                className="text-muted-foreground text-xs"
              >
                {errors.minimumSpend
                  ? errors.minimumSpend.message
                  : formatCurrency(minimumSpend)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-point-cost">Biaya poin</Label>
              <Input
                id="voucher-point-cost"
                type="number"
                min={0}
                placeholder="1500"
                aria-invalid={Boolean(errors.pointCost)}
                aria-describedby={
                  errors.pointCost ? "voucher-point-cost-error" : undefined
                }
                {...register("pointCost", { valueAsNumber: true })}
              />
              {errors.pointCost ? (
                <p
                  id="voucher-point-cost-error"
                  className="text-destructive text-sm"
                >
                  {errors.pointCost.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-quota">Kuota</Label>
              <Input
                id="voucher-quota"
                type="number"
                min={1}
                aria-invalid={Boolean(errors.quota)}
                aria-describedby={
                  errors.quota ? "voucher-quota-error" : undefined
                }
                {...register("quota", { valueAsNumber: true })}
              />
              {errors.quota ? (
                <p id="voucher-quota-error" className="text-destructive text-sm">
                  {errors.quota.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="voucher-start-date">Tanggal mulai</Label>
              <Input
                id="voucher-start-date"
                type="date"
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={
                  errors.startDate ? "voucher-start-date-error" : undefined
                }
                {...register("startDate")}
              />
              {errors.startDate ? (
                <p
                  id="voucher-start-date-error"
                  className="text-destructive text-sm"
                >
                  {errors.startDate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-end-date">Tanggal berakhir</Label>
              <Input
                id="voucher-end-date"
                type="date"
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={
                  errors.endDate ? "voucher-end-date-error" : undefined
                }
                {...register("endDate")}
              />
              {errors.endDate ? (
                <p
                  id="voucher-end-date-error"
                  className="text-destructive text-sm"
                >
                  {errors.endDate.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
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
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyValues(): FormValues {
  const today = new Date();
  const inAWeek = new Date(today);
  inAWeek.setDate(inAWeek.getDate() + 7);

  return {
    code: "",
    description: "",
    discountType: "percent",
    discountPercent: 0,
    discountAmount: 0,
    minimumSpend: 0,
    pointCost: 0,
    quota: 1,
    startDate: toDateInput(today),
    endDate: toDateInput(inAWeek),
  };
}

function toFormValues(voucher: Voucher): FormValues {
  return {
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountPercent: voucher.discountPercent,
    discountAmount: voucher.discountAmount,
    minimumSpend: voucher.minimumSpend,
    pointCost: voucher.pointCost,
    quota: voucher.quota,
    startDate: toDateInput(voucher.startDate),
    endDate: toDateInput(voucher.endDate),
  };
}

/**
 * `<input type="date">` speaks `yyyy-MM-dd` in local time, so the date is built
 * from the local parts; using `toISOString().slice(0, 10)` would shift the day
 * backwards for anyone east of UTC, which is everyone using this panel.
 */
function toDateInput(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Midnight local time on the chosen day. */
function toIsoStart(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

/** The last instant of the chosen day, so a voucher stays valid all day. */
function toIsoEnd(value: string): string {
  return new Date(`${value}T23:59:59`).toISOString();
}
