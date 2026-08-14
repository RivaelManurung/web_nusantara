"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import { ImageField } from "@/components/shared/image-field";
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

import { useCreateEvent, useEvent, useUpdateEvent } from "../queries";
import type { AppEvent, EventProduct, EventType } from "../types";
import { ProductSelectorDialog } from "./product-selector-dialog";

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: "Diskon", value: "DISKON" },
  { label: "Bundle", value: "BUNDLE" },
];

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  price: z.number(),
  unit: z.string(),
  image: z.string(),
});

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter.")
      .max(255, "Nama maksimal 255 karakter."),
    typeEvent: z.enum(["DISKON", "BUNDLE"]),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi."),
    endDate: z.string().min(1, "Tanggal selesai wajib diisi."),
    products: z.array(
      z.object({
        product: productSchema,
        discountPercent: z
          .number()
          .min(1, "Diskon minimal 1%.")
          .max(100, "Diskon maksimal 100%."),
      }),
    ),
    bundleBuys: z.array(
      z.object({
        product: productSchema,
        quantity: z.number().min(1, "Kuantitas minimal 1."),
      }),
    ),
    bundleRewards: z.array(
      z.object({
        product: productSchema,
        quantity: z.number().min(1, "Kuantitas minimal 1."),
      }),
    ),
    cover: z.instanceof(File).nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.endDate < values.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      });
    }
    if (values.typeEvent === "DISKON" && values.products.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["products"],
        message: "Pilih minimal satu produk yang didiskon.",
      });
    }
    if (values.typeEvent === "BUNDLE") {
      if (values.bundleBuys.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["bundleBuys"],
          message: "Pilih minimal satu produk yang harus dibeli.",
        });
      }
      if (values.bundleRewards.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["bundleRewards"],
          message: "Pilih minimal satu produk hadiah.",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

/** Which list the selector is currently filling. */
type SelectorTarget = "products" | "bundleBuys" | "bundleRewards";

const SELECTOR_TITLES: Record<SelectorTarget, string> = {
  products: "Pilih produk yang didiskon",
  bundleBuys: "Pilih produk yang harus dibeli",
  bundleRewards: "Pilih produk hadiah",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: AppEvent | null;
}

export function EventFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // The list row already carries the child rows, but it may be stale; the
  // detail request is what the form seeds from once it lands.
  const { data: detail, isLoading: isLoadingDetail } = useEvent(
    open && editing ? editing.id : null,
  );
  const source = detail ?? editing ?? null;

  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget | null>(
    null,
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  // `useWatch` rather than `watch`: it subscribes to one field instead of
  // returning a fresh function on every render.
  const typeEvent = useWatch({ control, name: "typeEvent" });

  const products = useFieldArray({ control, name: "products" });
  const bundleBuys = useFieldArray({ control, name: "bundleBuys" });
  const bundleRewards = useFieldArray({ control, name: "bundleRewards" });

  // Re-seed whenever the dialog opens, so reopening after a cancel does not
  // show the previous row's values.
  useEffect(() => {
    if (!open) return;
    reset(source ? toFormValues(source) : emptyValues());
  }, [open, reset, source]);

  function handleSelected(product: EventProduct) {
    if (selectorTarget === "products") {
      products.append({ product, discountPercent: 10 });
    } else if (selectorTarget === "bundleBuys") {
      bundleBuys.append({ product, quantity: 1 });
    } else if (selectorTarget === "bundleRewards") {
      bundleRewards.append({ product, quantity: 1 });
    }
  }

  async function onSubmit(values: FormValues) {
    // A new event has no cover to fall back on.
    if (!isEditing && !values.cover) {
      setError("cover", { message: "Cover wajib dipilih." });
      return;
    }

    const input = {
      name: values.name,
      typeEvent: values.typeEvent,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      products: values.products.map((item) => ({
        productId: item.product.id,
        discountPercent: item.discountPercent,
      })),
      bundleBuys: values.bundleBuys.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      bundleRewards: values.bundleRewards.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      cover: values.cover,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }

    onOpenChange(false);
  }

  const selectedIds =
    selectorTarget === "products"
      ? products.fields.map((field) => field.product.id)
      : selectorTarget === "bundleBuys"
        ? bundleBuys.fields.map((field) => field.product.id)
        : selectorTarget === "bundleRewards"
          ? bundleRewards.fields.map((field) => field.product.id)
          : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah event" : "Tambah event"}</DialogTitle>
          <DialogDescription>
            Event diskon memotong harga tiap produk; event bundle memberi produk
            hadiah ketika produk syarat dibeli.
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingDetail ? (
          <p className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Memuat detail event…
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-name">Nama event</Label>
                <Input
                  id="event-name"
                  placeholder="Promo Agustus"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "event-name-error" : undefined}
                  {...register("name")}
                />
                {errors.name ? (
                  <p id="event-name-error" className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Tipe event</Label>
                <Controller
                  control={control}
                  name="typeEvent"
                  render={({ field }) => (
                    <Select
                      items={EVENT_TYPES}
                      value={field.value}
                      // The backend cannot migrate a bundle's child rows into
                      // discount rows, so the type is fixed once saved.
                      disabled={isEditing}
                      onValueChange={(value) =>
                        field.onChange(value as EventType)
                      }
                    >
                      <SelectTrigger id="event-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {isEditing ? (
                  <p className="text-muted-foreground text-xs">
                    Tipe event tidak dapat diubah setelah dibuat.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-start-date">Tanggal mulai</Label>
                <Input
                  id="event-start-date"
                  type="datetime-local"
                  aria-invalid={Boolean(errors.startDate)}
                  aria-describedby={
                    errors.startDate ? "event-start-date-error" : undefined
                  }
                  {...register("startDate")}
                />
                {errors.startDate ? (
                  <p
                    id="event-start-date-error"
                    className="text-destructive text-sm"
                  >
                    {errors.startDate.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-end-date">Tanggal selesai</Label>
                <Input
                  id="event-end-date"
                  type="datetime-local"
                  aria-invalid={Boolean(errors.endDate)}
                  aria-describedby={
                    errors.endDate ? "event-end-date-error" : undefined
                  }
                  {...register("endDate")}
                />
                {errors.endDate ? (
                  <p
                    id="event-end-date-error"
                    className="text-destructive text-sm"
                  >
                    {errors.endDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            {typeEvent === "DISKON" ? (
              <ProductList
                legend="Produk yang didiskon"
                emptyMessage="Belum ada produk yang dipilih."
                error={errors.products?.message ?? errors.products?.root?.message}
                onAdd={() => setSelectorTarget("products")}
                items={products.fields.map((field, index) => ({
                  key: field.id,
                  product: field.product,
                  onRemove: () => products.remove(index),
                  control: (
                    <div className="space-y-1">
                      <Label
                        htmlFor={`event-discount-${field.id}`}
                        className="text-xs"
                      >
                        Diskon (%)
                      </Label>
                      <Input
                        id={`event-discount-${field.id}`}
                        type="number"
                        min={1}
                        max={100}
                        aria-invalid={Boolean(
                          errors.products?.[index]?.discountPercent,
                        )}
                        {...register(`products.${index}.discountPercent`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.products?.[index]?.discountPercent ? (
                        <p className="text-destructive text-xs">
                          {errors.products[index]?.discountPercent?.message}
                        </p>
                      ) : null}
                    </div>
                  ),
                }))}
              />
            ) : (
              <>
                <ProductList
                  legend="Produk yang harus dibeli"
                  emptyMessage="Belum ada produk syarat."
                  error={
                    errors.bundleBuys?.message ?? errors.bundleBuys?.root?.message
                  }
                  onAdd={() => setSelectorTarget("bundleBuys")}
                  items={bundleBuys.fields.map((field, index) => ({
                    key: field.id,
                    product: field.product,
                    onRemove: () => bundleBuys.remove(index),
                    control: (
                      <div className="space-y-1">
                        <Label
                          htmlFor={`event-buy-qty-${field.id}`}
                          className="text-xs"
                        >
                          Kuantitas
                        </Label>
                        <Input
                          id={`event-buy-qty-${field.id}`}
                          type="number"
                          min={1}
                          aria-invalid={Boolean(
                            errors.bundleBuys?.[index]?.quantity,
                          )}
                          {...register(`bundleBuys.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.bundleBuys?.[index]?.quantity ? (
                          <p className="text-destructive text-xs">
                            {errors.bundleBuys[index]?.quantity?.message}
                          </p>
                        ) : null}
                      </div>
                    ),
                  }))}
                />

                <ProductList
                  legend="Hadiah produk (reward)"
                  emptyMessage="Belum ada produk hadiah."
                  error={
                    errors.bundleRewards?.message ??
                    errors.bundleRewards?.root?.message
                  }
                  onAdd={() => setSelectorTarget("bundleRewards")}
                  items={bundleRewards.fields.map((field, index) => ({
                    key: field.id,
                    product: field.product,
                    onRemove: () => bundleRewards.remove(index),
                    control: (
                      <div className="space-y-1">
                        <Label
                          htmlFor={`event-reward-qty-${field.id}`}
                          className="text-xs"
                        >
                          Kuantitas
                        </Label>
                        <Input
                          id={`event-reward-qty-${field.id}`}
                          type="number"
                          min={1}
                          aria-invalid={Boolean(
                            errors.bundleRewards?.[index]?.quantity,
                          )}
                          {...register(`bundleRewards.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.bundleRewards?.[index]?.quantity ? (
                          <p className="text-destructive text-xs">
                            {errors.bundleRewards[index]?.quantity?.message}
                          </p>
                        ) : null}
                      </div>
                    ),
                  }))}
                />
              </>
            )}

            <Controller
              control={control}
              name="cover"
              render={({ field }) => (
                <ImageField
                  id="event-cover"
                  label="Cover"
                  currentUrl={source?.cover}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.cover?.message}
                />
              )}
            />

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
        )}
      </DialogContent>

      {/* Mounted only while open, so the product query does not run until asked. */}
      {selectorTarget ? (
        <ProductSelectorDialog
          open
          onOpenChange={(isOpen) => !isOpen && setSelectorTarget(null)}
          title={SELECTOR_TITLES[selectorTarget]}
          selectedIds={selectedIds}
          onSelect={handleSelected}
        />
      ) : null}
    </Dialog>
  );
}

interface ProductListItem {
  key: string;
  product: EventProduct;
  onRemove: () => void;
  /** The per-product number input, which differs between DISKON and BUNDLE. */
  control: React.ReactNode;
}

function ProductList({
  legend,
  emptyMessage,
  error,
  items,
  onAdd,
}: {
  legend: string;
  emptyMessage: string;
  error?: string;
  items: ProductListItem[];
  onAdd: () => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-medium">{legend}</legend>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" aria-hidden />
          Pilih produk
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="bg-card relative space-y-2 rounded-md border p-2"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive absolute top-1 right-1 size-7"
                onClick={item.onRemove}
                aria-label={`Hapus ${item.product.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>

              <div className="bg-muted relative h-20 w-full overflow-hidden rounded">
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium"
                  title={item.product.name}
                >
                  {item.product.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {item.product.code}
                </p>
              </div>

              {item.control}
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </fieldset>
  );
}

function emptyValues(): FormValues {
  return {
    name: "",
    typeEvent: "DISKON",
    startDate: "",
    endDate: "",
    products: [],
    bundleBuys: [],
    bundleRewards: [],
    cover: null,
  };
}

function toFormValues(event: AppEvent): FormValues {
  return {
    name: event.name,
    typeEvent: event.typeEvent,
    startDate: toDateTimeInput(event.startDate),
    endDate: toDateTimeInput(event.endDate),
    products: event.products.map((item) => ({
      product: item.product,
      discountPercent: item.discountPercent,
    })),
    bundleBuys: event.bundleBuys.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    bundleRewards: event.bundleRewards.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    cover: null,
  };
}

/**
 * `<input type="datetime-local">` speaks local time without a zone, so the value
 * is built from the local parts; slicing an ISO string would show the UTC clock
 * and silently shift every event by seven hours.
 */
function toDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => `${part}`.padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
