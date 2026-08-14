"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";

import {
  useCreateProduct,
  useTypeProductOptions,
  useUpdateProduct,
} from "../queries";
import type { GalleryItem, Product } from "../types";
import { ProductGalleryField } from "./product-gallery-field";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(255, "Nama maksimal 255 karakter."),
  code: z
    .string()
    .min(1, "Kode produk wajib diisi.")
    .max(64, "Kode maksimal 64 karakter."),
  price: z
    .number({ message: "Harga wajib diisi." })
    .int("Harga harus bilangan bulat.")
    .min(0, "Harga tidak boleh negatif."),
  unit: z
    .string()
    .min(1, "Unit wajib diisi.")
    .max(32, "Unit maksimal 32 karakter."),
  description: z.string().max(2000, "Deskripsi maksimal 2000 karakter."),
  typeProductId: z.string().min(1, "Tipe produk wajib dipilih."),
  cover: z.instanceof(File).nullable(),
  // Files and URLs rather than a validated value, but kept in the form so one
  // `reset()` re-seeds the whole dialog.
  gallery: z.array(z.custom<GalleryItem>()),
  galleryChanged: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  code: "",
  price: 0,
  unit: "",
  description: "",
  typeProductId: "",
  cover: null,
  gallery: [],
  galleryChanged: false,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: typeProducts, isLoading: isLoadingTypes } =
    useTypeProductOptions();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  // Re-seed whenever the dialog opens, so reopening after a cancel does not
  // show the previous row's values.
  useEffect(() => {
    if (!open) return;

    reset(
      editing
        ? {
            name: editing.name,
            code: editing.code,
            price: editing.price,
            unit: editing.unit,
            description: editing.description ?? "",
            typeProductId: editing.typeProductId ?? "",
            cover: null,
            gallery: editing.images.map((url) => ({
              kind: "existing" as const,
              url,
            })),
            galleryChanged: false,
          }
        : EMPTY,
    );
  }, [editing, open, reset]);

  async function onSubmit(values: FormValues) {
    // A new product has nothing to fall back on if no cover is chosen.
    if (!isEditing && !values.cover) {
      setError("cover", { message: "Gambar utama wajib dipilih." });
      return;
    }

    const input = {
      name: values.name,
      code: values.code,
      price: values.price,
      unit: values.unit,
      description: values.description,
      typeProductId: values.typeProductId,
      cover: values.cover,
      gallery: values.gallery,
      galleryChanged: values.galleryChanged,
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
            {isEditing ? "Ubah Produk" : "Tambah Produk"}
          </DialogTitle>
          <DialogDescription>
            Data katalog yang dipakai semua toko. Harga di sini adalah harga
            dasar produk.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nama produk</Label>
              <Input
                id="product-name"
                placeholder="Keripik singkong balado"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "product-name-error" : undefined
                }
                {...register("name")}
              />
              {errors.name ? (
                <p id="product-name-error" className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-code">Kode produk</Label>
              <Input
                id="product-code"
                placeholder="KRP-001"
                aria-invalid={Boolean(errors.code)}
                aria-describedby={
                  errors.code ? "product-code-error" : undefined
                }
                {...register("code")}
              />
              {errors.code ? (
                <p id="product-code-error" className="text-destructive text-sm">
                  {errors.code.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Harga (Rp)</Label>
              <Input
                id="product-price"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={
                  errors.price ? "product-price-error" : undefined
                }
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price ? (
                <p
                  id="product-price-error"
                  className="text-destructive text-sm"
                >
                  {errors.price.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-unit">Unit</Label>
              <Input
                id="product-unit"
                placeholder="pcs, kotak, kg"
                aria-invalid={Boolean(errors.unit)}
                aria-describedby={
                  errors.unit ? "product-unit-error" : undefined
                }
                {...register("unit")}
              />
              {errors.unit ? (
                <p id="product-unit-error" className="text-destructive text-sm">
                  {errors.unit.message}
                </p>
              ) : null}
            </div>
          </div>

          <Controller
            control={control}
            name="typeProductId"
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="product-type">Tipe produk</Label>
                <Select
                  items={(typeProducts ?? []).map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  disabled={isLoadingTypes}
                >
                  <SelectTrigger
                    id="product-type"
                    className="w-full"
                    aria-invalid={Boolean(errors.typeProductId)}
                    aria-describedby={
                      errors.typeProductId ? "product-type-error" : undefined
                    }
                  >
                    <SelectValue
                      placeholder={
                        isLoadingTypes ? "Memuat tipe…" : "Pilih tipe produk"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(typeProducts ?? []).map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.typeProductId ? (
                  <p
                    id="product-type-error"
                    className="text-destructive text-sm"
                  >
                    {errors.typeProductId.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="product-description">Deskripsi</Label>
            <Textarea
              id="product-description"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "product-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description ? (
              <p
                id="product-description-error"
                className="text-destructive text-sm"
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="cover"
            render={({ field }) => (
              <ImageField
                id="product-cover"
                label="Gambar utama"
                currentUrl={editing?.coverImage ?? undefined}
                value={field.value}
                onChange={field.onChange}
                error={errors.cover?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="gallery"
            render={({ field }) => (
              <ProductGalleryField
                id="product-gallery"
                label="Galeri gambar"
                value={field.value}
                onChange={(items) => {
                  field.onChange(items);
                  // Marks the gallery as touched, so the save resends it whole
                  // rather than leaving the stored one alone.
                  setValue("galleryChanged", true);
                }}
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
      </DialogContent>
    </Dialog>
  );
}
