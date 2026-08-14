"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useInvalidSubmit } from "@/hooks/use-invalid-submit";
import { z } from "zod";

import { FormActions } from "@/components/shared/form-actions";
import { ImageField } from "@/components/shared/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/config/routes";

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
  /** Absent when creating. */
  editing?: Banner | null;
}

export function BannerForm({ editing }: Props) {
  const router = useRouter();
  const isEditing = Boolean(editing);

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onInvalid = useInvalidSubmit();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Seeded once at mount; the page remounts per record, so there is no stale
    // state to reset.
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      isActive: editing?.isActive ?? true,
      image: null,
    },
  });

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

    router.push(ROUTES.banners);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5"
      noValidate
    >
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
          <p id="banner-description-error" className="text-destructive text-sm">
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

      <FormActions cancelHref={ROUTES.banners} isPending={isPending} />
    </form>
  );
}
