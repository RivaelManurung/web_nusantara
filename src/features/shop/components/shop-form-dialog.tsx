"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ImageField } from "@/components/shared/image-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCashierOptions } from "@/features/cashier/queries";
import { useProducts } from "@/features/product/queries";

import { useCreateShop, useShop, useUpdateShop } from "../queries";
import type {
  GalleryItem,
  ProductPick,
  Shop,
  ShopProductInput,
} from "../types";
import { ShopLocationFields } from "./shop-location-fields";
import { ShopRelationsFields } from "./shop-relations-fields";

/**
 * The scalar half of the form.
 *
 * Cashiers, products and the gallery carry `File` handles and nested rows, so
 * they live as component state and are validated on submit instead of being
 * threaded through react-hook-form.
 */
const schema = z.object({
  name: z
    .string()
    .min(2, "Nama toko minimal 2 karakter.")
    .max(255, "Nama toko maksimal 255 karakter."),
  description: z
    .string()
    .min(5, "Deskripsi minimal 5 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  fullAddress: z
    .string()
    .min(5, "Alamat minimal 5 karakter.")
    .max(500, "Alamat maksimal 500 karakter."),
  lat: z
    .number({ message: "Latitude wajib diisi." })
    .min(-90, "Latitude harus antara -90 dan 90.")
    .max(90, "Latitude harus antara -90 dan 90."),
  lng: z
    .number({ message: "Longitude wajib diisi." })
    .min(-180, "Longitude harus antara -180 dan 180.")
    .max(180, "Longitude harus antara -180 dan 180."),
  cover: z.instanceof(File).nullable(),
});

export type ShopFormValues = z.infer<typeof schema>;

/** Jakarta, the same starting point the old map used. */
const DEFAULT_COORDINATES = { lat: -6.2088, lng: 106.8456 } as const;

const MAX_GALLERY_MB = 2;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: Shop | null;
}

/**
 * Chrome and data loading only.
 *
 * The form itself is a separate component so that seeding it is a mount rather
 * than an effect: this wrapper renders nothing until the shop it is editing has
 * arrived, then mounts the body keyed by shop id. Opening a different row, or
 * reopening the same one after a cancel, remounts the body with fresh state --
 * which is what a "reset the form" effect was doing by hand, one render too
 * late and with an empty-fields flash in between.
 */
export function ShopFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);

  // The list response does not reliably carry the relations, so the form seeds
  // itself from the detail endpoint.
  const { data: detail, isLoading: isLoadingDetail } = useShop(
    open && editing ? editing.id : null,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Toko" : "Tambah Toko"}</DialogTitle>
          <DialogDescription>
            Lengkapi informasi toko, lokasinya, kasir yang bertugas, dan produk
            yang dijual.
          </DialogDescription>
        </DialogHeader>

        {!open ? null : isEditing && isLoadingDetail ? (
          <Skeleton className="h-96 w-full" />
        ) : isEditing && !detail ? (
          <Alert variant="destructive">
            <AlertDescription>
              Gagal memuat data toko. Tutup dialog ini dan coba lagi.
            </AlertDescription>
          </Alert>
        ) : (
          <ShopFormBody
            key={editing?.id ?? "new"}
            shop={isEditing ? (detail ?? null) : null}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface BodyProps {
  /** The shop being edited, already loaded. Null means this is a create. */
  shop: Shop | null;
  onOpenChange: (open: boolean) => void;
}

function ShopFormBody({ shop, onOpenChange }: BodyProps) {
  const isEditing = Boolean(shop);

  const { data: cashierPage, isLoading: isLoadingCashiers } =
    useCashierOptions();
  // The catalogue's first page, reused from the product feature rather than
  // restating `/product` here.
  const { data: productPage, isLoading: isLoadingProducts } = useProducts({
    page: 1,
  });

  const createMutation = useCreateShop();
  const updateMutation = useUpdateShop();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Seeded once, at mount. The wrapper's `key` is what re-seeds them.
  const [cashierIds, setCashierIds] = useState<string[]>(
    () => shop?.cashiers.map((cashier) => cashier.id) ?? [],
  );
  const [products, setProducts] = useState<ShopProductInput[]>(
    () =>
      shop?.products.map((product) => ({
        productId: product.id,
        name: product.name,
        stock: product.stock,
        price: product.price,
        isActive: product.isActive,
      })) ?? [],
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(
    () => shop?.gallery.map((url) => ({ kind: "existing", url }) as const) ?? [],
  );
  const [hasRemovedGallery, setHasRemovedGallery] = useState(false);
  const [relationError, setRelationError] = useState<{
    cashiers?: string;
    products?: string;
  }>({});

  /**
   * Every object URL this form has minted.
   *
   * Recorded at creation rather than read off `gallery`, so the unmount cleanup
   * needs no dependency on state it would otherwise have to re-subscribe to.
   * Revoking an already-revoked URL is a no-op, so removing an image eagerly
   * and cleaning up again here is safe.
   */
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shop?.name ?? "",
      description: shop?.description ?? "",
      fullAddress: shop?.fullAddress ?? "",
      lat: shop?.lat ?? DEFAULT_COORDINATES.lat,
      lng: shop?.lng ?? DEFAULT_COORDINATES.lng,
      cover: null,
    },
  });

  const handleToggleCashier = useCallback((id: string, selected: boolean) => {
    setCashierIds((current) =>
      selected ? [...current, id] : current.filter((value) => value !== id),
    );
  }, []);

  const handleToggleProduct = useCallback(
    (option: ProductPick, selected: boolean) => {
      setProducts((current) => {
        if (!selected) {
          return current.filter((row) => row.productId !== option.id);
        }
        if (current.some((row) => row.productId === option.id)) return current;
        return [
          ...current,
          {
            productId: option.id,
            name: option.name,
            stock: 0,
            price: null,
            isActive: true,
          },
        ];
      });
    },
    [],
  );

  const handleChangeProduct = useCallback(
    (productId: string, patch: Partial<ShopProductInput>) => {
      setProducts((current) =>
        current.map((row) =>
          row.productId === productId ? { ...row, ...patch } : row,
        ),
      );
    },
    [],
  );

  function handleAddGallery(files: FileList | null) {
    if (!files) return;

    const added = Array.from(files)
      .filter((file) => file.size <= MAX_GALLERY_MB * 1024 * 1024)
      .map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        return { kind: "new", file, url } as const;
      });

    setGallery((current) => [...current, ...added]);
  }

  function handleRemoveGallery(index: number) {
    const item = gallery[index];
    if (!item) return;

    if (item.kind === "new") URL.revokeObjectURL(item.url);
    // Removing an image the server already has can only be expressed as a full
    // gallery replace.
    if (item.kind === "existing") setHasRemovedGallery(true);

    setGallery((current) =>
      current.filter((_, position) => position !== index),
    );
  }

  async function onSubmit(values: ShopFormValues) {
    const nextRelationError: typeof relationError = {};
    if (cashierIds.length === 0) {
      nextRelationError.cashiers = "Pilih minimal satu kasir.";
    }
    if (products.length === 0) {
      nextRelationError.products = "Pilih minimal satu produk.";
    }
    setRelationError(nextRelationError);

    // A new shop has no existing cover to fall back on.
    if (!isEditing && !values.cover) {
      setError("cover", { message: "Gambar cover wajib dipilih." });
      return;
    }
    if (Object.keys(nextRelationError).length > 0) return;

    const input = {
      name: values.name,
      description: values.description,
      fullAddress: values.fullAddress,
      lat: values.lat,
      lng: values.lng,
      cashierIds,
      products,
      cover: values.cover,
      gallery,
      hasRemovedGallery,
    };

    if (shop) {
      await updateMutation.mutateAsync({ id: shop.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }

    onOpenChange(false);
  }

  // useWatch rather than watch(): watch() returns a fresh function on every
  // render, which makes React Compiler skip memoizing this whole dialog.
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shop-name">Nama toko</Label>
          <Input
            id="shop-name"
            placeholder="Toko Menara A"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "shop-name-error" : undefined}
            {...register("name")}
          />
          {errors.name ? (
            <p id="shop-name-error" className="text-destructive text-sm">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shop-description">Deskripsi</Label>
          <Textarea
            id="shop-description"
            rows={2}
            placeholder="Toko ini berada di sebelah komplek perumahan…"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "shop-description-error" : undefined
            }
            {...register("description")}
          />
          {errors.description ? (
            <p id="shop-description-error" className="text-destructive text-sm">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>

      <ShopLocationFields
        register={register}
        errors={errors}
        lat={lat}
        lng={lng}
      />

      <ShopRelationsFields
        cashiers={cashierPage?.items ?? []}
        products={productPage?.items ?? []}
        isLoadingOptions={isLoadingCashiers || isLoadingProducts}
        selectedCashierIds={cashierIds}
        onToggleCashier={handleToggleCashier}
        cashierError={relationError.cashiers}
        selectedProducts={products}
        onToggleProduct={handleToggleProduct}
        onChangeProduct={handleChangeProduct}
        productError={relationError.products}
      />

      <Controller
        control={control}
        name="cover"
        render={({ field }) => (
          <ImageField
            id="shop-cover"
            label="Gambar utama (cover)"
            currentUrl={shop?.cover ?? undefined}
            value={field.value}
            onChange={field.onChange}
            error={errors.cover?.message}
          />
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="shop-gallery">Galeri gambar</Label>
        <Input
          id="shop-gallery"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            handleAddGallery(event.target.files);
            // Clearing lets the same file be picked again after a removal.
            event.target.value = "";
          }}
        />
        <p className="text-muted-foreground text-xs">
          PNG, JPG, atau WebP. Maksimal {MAX_GALLERY_MB} MB per gambar.
        </p>

        {gallery.length > 0 ? (
          <ul className="flex flex-wrap gap-3 pt-1">
            {gallery.map((item, index) => (
              <li key={item.url} className="relative">
                <div className="bg-muted relative size-20 overflow-hidden rounded-md border">
                  <Image
                    src={item.url}
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
                  onClick={() => handleRemoveGallery(index)}
                  aria-label={`Hapus gambar galeri ${index + 1}`}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground flex items-center gap-2 pt-1 text-xs">
            <ImagePlus className="size-4" aria-hidden />
            Belum ada gambar galeri.
          </p>
        )}

        {hasRemovedGallery ? (
          <p className="text-muted-foreground text-xs">
            Gambar lama dihapus, sehingga seluruh galeri akan dikirim ulang saat
            disimpan.
          </p>
        ) : null}
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
  );
}
