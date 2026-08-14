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

import { useCreateTypeProduct, useUpdateTypeProduct } from "../queries";
import type { TypeProduct } from "../types";

const schema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(255, "Nama maksimal 255 karakter."),
  image: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent when creating. */
  editing?: TypeProduct | null;
}

export function TypeProductFormDialog({ open, onOpenChange, editing }: Props) {
  const isEditing = Boolean(editing);
  const createMutation = useCreateTypeProduct();
  const updateMutation = useUpdateTypeProduct();
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
    defaultValues: { name: "", image: null },
  });

  // Re-seed whenever the dialog opens, so reopening after a cancel does not
  // show the previous row's values.
  useEffect(() => {
    if (open) reset({ name: editing?.name ?? "", image: null });
  }, [editing, open, reset]);

  async function onSubmit(values: FormValues) {
    // A new category has nothing to fall back on if no picture is chosen.
    if (!isEditing && !values.image) {
      setError("image", { message: "Gambar wajib dipilih." });
      return;
    }

    const input = { name: values.name, image: values.image };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Ubah Tipe Produk" : "Tambah Tipe Produk"}
          </DialogTitle>
          <DialogDescription>
            Tipe produk mengelompokkan katalog, misalnya “Keripik &amp;
            Kerupuk”.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="type-product-name">Nama</Label>
            <Input
              id="type-product-name"
              placeholder="Keripik & Kerupuk"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? "type-product-name-error" : undefined
              }
              {...register("name")}
            />
            {errors.name ? (
              <p
                id="type-product-name-error"
                className="text-destructive text-sm"
              >
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <ImageField
                id="type-product-image"
                label="Gambar"
                currentUrl={editing?.image}
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
