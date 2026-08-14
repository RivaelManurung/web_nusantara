"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { z } from "zod";

import { DateField } from "@/components/shared/date-field";
import { FormActions } from "@/components/shared/form-actions";
import { NumberField } from "@/components/shared/number-field";
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
import { ROUTES } from "@/config/routes";

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
  /** Absent when creating. */
  editing?: Voucher | null;
}

export function VoucherForm({ editing }: Props) {
  const router = useRouter();

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onInvalid = useInvalidSubmit();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Seeded once at mount; the page remounts per record, so there is no stale
    // state to reset.
    defaultValues: editing ? toFormValues(editing) : emptyValues(),
  });

  // `useWatch` rather than `watch`: it subscribes to one field instead of
  // returning a fresh function on every render.
  const discountType = useWatch({ control, name: "discountType" });

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

    router.push(ROUTES.vouchers);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
      noValidate
    >
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
        <Controller
          control={control}
          name="discountPercent"
          render={({ field }) => (
            <NumberField
              id="voucher-discount-percent"
              label="Persentase diskon"
              suffix="%"
              placeholder="10"
              value={field.value}
              onChange={(next) => field.onChange(toNumber(next))}
              error={errors.discountPercent?.message}
            />
          )}
        />
      ) : (
        <Controller
          control={control}
          name="discountAmount"
          render={({ field }) => (
            <NumberField
              id="voucher-discount-amount"
              label="Nominal diskon"
              prefix="Rp"
              placeholder="25.000"
              value={field.value}
              onChange={(next) => field.onChange(toNumber(next))}
              error={errors.discountAmount?.message}
            />
          )}
        />
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
        <Controller
          control={control}
          name="minimumSpend"
          render={({ field }) => (
            <NumberField
              id="voucher-minimum-spend"
              label="Minimal belanja"
              prefix="Rp"
              value={field.value}
              onChange={(next) => field.onChange(toNumber(next))}
              error={errors.minimumSpend?.message}
              // No readback line: the field now groups its own thousands and
              // carries the Rp prefix, so repeating the amount underneath said
              // the same thing twice.
            />
          )}
        />

        <Controller
          control={control}
          name="pointCost"
          render={({ field }) => (
            <NumberField
              id="voucher-point-cost"
              label="Biaya poin"
              placeholder="1.500"
              value={field.value}
              onChange={(next) => field.onChange(toNumber(next))}
              error={errors.pointCost?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="quota"
          render={({ field }) => (
            <NumberField
              id="voucher-quota"
              label="Kuota"
              value={field.value}
              onChange={(next) => field.onChange(toNumber(next))}
              error={errors.quota?.message}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DateField
              id="voucher-start-date"
              label="Tanggal mulai"
              value={field.value}
              onChange={field.onChange}
              error={errors.startDate?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="endDate"
          render={({ field }) => (
            <DateField
              id="voucher-end-date"
              label="Tanggal berakhir"
              value={field.value}
              onChange={field.onChange}
              error={errors.endDate?.message}
            />
          )}
        />
      </div>

      <FormActions cancelHref={ROUTES.vouchers} isPending={isPending} />
    </form>
  );
}

/**
 * `NumberField` reports an empty box as null, which the schema does not model.
 * Zero is the right reading of "nothing typed" for every amount here -- and
 * where zero is not allowed, the field's own rule says so ("Kuota minimal 1.",
 * "Persentase diskon harus lebih dari 0."), so the message the user sees is
 * still the one the schema wrote.
 */
function toNumber(value: number | null): number {
  return value ?? 0;
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
 * `DateField` speaks `yyyy-MM-dd` in local time, so the date is built from the
 * local parts; using `toISOString().slice(0, 10)` would shift the day backwards
 * for anyone east of UTC, which is everyone using this panel.
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
