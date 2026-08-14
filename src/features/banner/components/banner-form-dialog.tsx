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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useCreateBanner, useUpdateBanner } from "../queries";
import type { Banner } from "../types";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(255, "Nama maksimal 255 karakter."),
  description: z
    .string()
    .min(2, "Deskripsi minimal 2 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
  isActive: z.boolean(),
  image: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: Banner | null;
}

export function BannerFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", isActive: true, image: null },
  });

  // Re-seed whenever the dialog opens, so reopening after a cancel does not
  // show the previous row's values.
  useEffect(() => {
    if (!open) return;
    reset({
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      isActive: editing?.isActive ?? true,
      image: null,
    });
  }, [editing, open, reset]);

  async function onSubmit(values: FormValues) {
    // A new banner has nothing to fall back on if no artwork is chosen.
    if (!isEditing && !values.image) {
      setError("image", { message: "Gambar wajib dipilih." });
      return;
    }

    if (editing) {
      // Status is changed from the table switch, which hits `/edit-status`.
      await updateMutation.mutateAsync({
        id: editing.id,
        input: {
          name: values.name,
          description: values.description,
          image: values.image,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description,
        isActive: values.isActive,
        image: values.image,
      });
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah banner" : "Tambah banner"}</DialogTitle>
          <DialogDescription>
            Banner tampil di beranda aplikasi. Gunakan gambar yang menarik agar
            promosi lebih efektif.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="banner-name">Nama banner</Label>
            <Input
              id="banner-name"
              placeholder="Promo Agustus"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "banner-name-error" : undefined}
              {...register("name")}
            />
            {errors.name ? (
              <p id="banner-name-error" className="text-destructive text-sm">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-description">Deskripsi</Label>
            <Textarea
              id="banner-description"
              rows={4}
              placeholder="Diskon spesial kemerdekaan…"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "banner-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description ? (
              <p
                id="banner-description-error"
                className="text-destructive text-sm"
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          {isEditing ? null : (
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="banner-status">Tayangkan banner</Label>
                    <p className="text-muted-foreground text-xs">
                      Status hanya bisa diatur saat menambah; ubah lewat tabel
                      setelahnya.
                    </p>
                  </div>
                  <Switch
                    id="banner-status"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          )}

          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageField
                id="banner-image"
                label="Gambar"
                currentUrl={editing?.photo}
                value={field.value}
                onChange={field.onChange}
                error={errors.image?.message}
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
